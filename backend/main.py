from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

from google.cloud import dialogflow_v2 as dialogflow
import googlemaps


app = FastAPI(title="Makanbot Python Backend", version="0.1.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    location: str | None = None  # "lat,lng"; default Singapore
    radius_meters: int | None = 5000


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

