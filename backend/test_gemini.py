import os
import google.generativeai as genai

# Set your key here (or use .env)
os.environ["GEMINI_API_KEY"] = "AIzaSyA_yiOp2h1KBj5uALwrDLMsNUrQXpF0tKg"
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Pick the model
model = genai.GenerativeModel("gemini-2.5-flash")

# Test generateContent
try:
    response = model.generate_content("Hello, can you recommend some sushi near Kuchai Lama, Malaysia?")
    print("Response:", response.text)
except Exception as e:
    print("Error:", e)
