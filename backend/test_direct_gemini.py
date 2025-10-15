import os
import google.generativeai as genai

# Test the API key directly
api_key = "AIzaSyA_yiOp2h1KBj5uALwrDLMsNUrQXpF0tKg"

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    response = model.generate_content("Hello, test message")
    print("✅ Direct API call successful!")
    print("Response:", response.text[:100] + "...")
    
except Exception as e:
    print("❌ Direct API call failed:")
    print("Error:", str(e))
    print("Error type:", type(e).__name__)
