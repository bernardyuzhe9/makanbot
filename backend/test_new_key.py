import os
import google.generativeai as genai

# Test the new API key directly
api_key = "AIzaSyDcL7a1PVtzZBID59U7Z4iC6M9alzUwTqY"

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    response = model.generate_content("Hello, test message")
    print("✅ New API key works!")
    print("Response:", response.text[:100] + "...")
    
except Exception as e:
    print("❌ New API key failed:")
    print("Error:", str(e))
    print("Error type:", type(e).__name__)
