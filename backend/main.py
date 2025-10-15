from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

from google.cloud import dialogflow_v2 as dialogflow
import googlemaps
import google.generativeai as genai


app = FastAPI(title="Makanbot Python Backend", version="0.1.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3002", "http://127.0.0.1:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/hello")
def hello(name: str = "world") -> dict:
    return {"message": f"Hello, {name}!"}

@app.get("/test-gemini")
def test_gemini():
    """Test endpoint to check if Gemini API key is set"""
    gemini_key = os.getenv("GEMINI_API_KEY")
    maps_key = os.getenv("GOOGLE_MAPS_API_KEY")
    
    return {
        "gemini_key_set": bool(gemini_key),
        "maps_key_set": bool(maps_key),
        "gemini_key_length": len(gemini_key) if gemini_key else 0,
        "maps_key_length": len(maps_key) if maps_key else 0
    }

@app.get("/list-models")
def list_models():
    """List available Gemini models"""
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        return {"error": "GEMINI_API_KEY not set"}
    
    try:
        genai.configure(api_key=gemini_key)
        models = genai.list_models()
        model_names = [model.name for model in models if 'generateContent' in model.supported_generation_methods]
        return {"available_models": model_names}
    except Exception as e:
        return {"error": str(e)}


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    location: str | None = None  # "lat,lng"; default Singapore
    radius_meters: int | None = 5000

class GeminiRequest(BaseModel):
    message: str
    location: str = "1.3521,103.8198"  # Singapore default
    radius_meters: int = 5000


def detect_intent_text(project_id: str, text: str, session_id: str, language_code: str = "en"):
    session_client = dialogflow.SessionsClient()
    session = session_client.session_path(project_id, session_id)
    text_input = dialogflow.TextInput(text=text, language_code=language_code)
    query_input = dialogflow.QueryInput(text=text_input)
    response = session_client.detect_intent(session=session, query_input=query_input)
    return response


def search_restaurants(api_key: str, keyword: str, location: str, radius: int = 5000):
    gmaps = googlemaps.Client(key=api_key)
    lat_str, lng_str = location.split(",") if "," in location else ("1.3521", "103.8198")
    lat, lng = float(lat_str), float(lng_str)
    places = gmaps.places_nearby(location=(lat, lng), radius=radius, type="restaurant", keyword=keyword)
    results = []
    for place in places.get("results", [])[:5]:
        results.append({
            "name": place.get("name"),
            "rating": place.get("rating"),
            "address": place.get("vicinity"),
            "place_id": place.get("place_id"),
        })
    return results


@app.post("/chat")
def chat(body: ChatRequest):
    project_id = os.getenv("DIALOGFLOW_PROJECT_ID")
    maps_key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not project_id:
        raise HTTPException(status_code=500, detail="DIALOGFLOW_PROJECT_ID not set")
    if not maps_key:
        raise HTTPException(status_code=500, detail="GOOGLE_MAPS_API_KEY not set")

    session_id = body.session_id or "makanbot-session"
    user_text = body.message
    location = body.location or "1.3521,103.8198"
    radius = body.radius_meters or 5000

    try:
        df_res = detect_intent_text(project_id, user_text, session_id)
        intent = df_res.query_result.intent.display_name if df_res.query_result.intent else None
        fulfillment = df_res.query_result.fulfillment_text

        params = df_res.query_result.parameters
        cuisine = None
        if hasattr(params, "fields"):
            fields = params.fields
            if "cuisine" in fields and fields["cuisine"].WhichOneof("kind"):
                cuisine = fields["cuisine"].string_value or None

        restaurants = []
        should_search = False
        if intent and "find" in intent.lower() and "restaurant" in intent.lower():
            should_search = True

        # naive fallback keyword extraction if no intent/cuisine
        if not should_search:
            lower = user_text.lower()
            known_keywords = [
                "sushi", "pizza", "burger", "thai", "korean", "ramen", "steak",
                "seafood", "chicken", "indian", "indonesian", "malay", "dim sum",
                "noodle", "cafe", "bakery", "coffee",
            ]
            for kw in known_keywords:
                if kw in lower:
                    cuisine = kw
                    should_search = True
                    break

        if should_search:
            restaurants = search_restaurants(maps_key, cuisine or "restaurant", location, radius)

        return {
            "intent": intent,
            "reply": fulfillment,
            "cuisine": cuisine,
            "restaurants": restaurants,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/gemini-chat")
def gemini_chat(body: GeminiRequest):
    """New Gemini-powered chat endpoint for food recommendations"""
    gemini_key = os.getenv("GEMINI_API_KEY")
    maps_key = os.getenv("GOOGLE_MAPS_API_KEY")
    
    if not gemini_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set")
    if not maps_key:
        raise HTTPException(status_code=500, detail="GOOGLE_MAPS_API_KEY not set")

    try:
        # Configure Gemini
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        # Create food-focused prompt
        prompt = f"""
        You are MakanBot, a helpful AI assistant specializing in food recommendations in Singapore.
        User query: "{body.message}"
        User location: {body.location} (Singapore coordinates)
        Search radius: {body.radius_meters}m
        
        Please provide:
        1. A friendly, conversational response about food recommendations
        2. Suggest specific cuisines or dishes based on their request
        3. Mention any dietary preferences if relevant (halal, vegetarian, etc.)
        4. Keep response under 200 words and conversational
        
        Focus on being helpful for finding great food nearby.
        """
        
        # Get Gemini response
        response = model.generate_content(prompt)
        gemini_reply = response.text
        
        # Extract keywords for restaurant search
        user_text = body.message.lower()
        cuisine_keywords = [
            "sushi", "pizza", "burger", "thai", "korean", "ramen", "steak",
            "seafood", "chicken", "indian", "indonesian", "malay", "dim sum",
            "noodle", "cafe", "bakery", "coffee", "chinese", "japanese",
            "italian", "western", "local", "halal", "vegetarian"
        ]
        
        cuisine = None
        for keyword in cuisine_keywords:
            if keyword in user_text:
                cuisine = keyword
                break
        
        # Search for restaurants
        restaurants = search_restaurants(maps_key, cuisine or "restaurant", body.location, body.radius_meters)
        
        return {
            "reply": gemini_reply,
            "cuisine": cuisine,
            "restaurants": restaurants,
            "source": "gemini"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini error: {str(e)}")

