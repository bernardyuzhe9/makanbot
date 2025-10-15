import requests
import json

# Test the backend API
try:
    # Test health endpoint
    health_response = requests.get("http://127.0.0.1:8000/health")
    print("Health check:", health_response.json())
    
    # Test gemini endpoint
    gemini_response = requests.get("http://127.0.0.1:8000/test-gemini")
    print("Gemini test:", gemini_response.json())
    
    # Check if the new API key is being used
    if gemini_response.json().get('gemini_key_set'):
        print("✅ API key is loaded in backend")
    else:
        print("❌ API key not loaded in backend")
    
    # Test gemini chat endpoint
    chat_data = {
        "message": "Find sushi near me",
        "location": "1.3000,103.8550",
        "radius_meters": 2000
    }
    
    chat_response = requests.post(
        "http://127.0.0.1:8000/gemini-chat",
        headers={"Content-Type": "application/json"},
        data=json.dumps(chat_data)
    )
    
    if chat_response.status_code == 200:
        print("✅ Gemini chat working!")
        print("Response:", chat_response.json())
    else:
        print("❌ Gemini chat error:", chat_response.status_code)
        print("Error:", chat_response.text)
        
except Exception as e:
    print("Error:", e)
