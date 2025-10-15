import requests
import json

# Test the new restaurant search endpoint
try:
    search_data = {
        "keyword": "sushi",
        "location": "1.3000,103.8550",
        "radius_meters": 2000
    }
    
    response = requests.post(
        "http://127.0.0.1:8000/search-restaurants",
        headers={"Content-Type": "application/json"},
        data=json.dumps(search_data)
    )
    
    if response.status_code == 200:
        print("✅ Restaurant search endpoint working!")
        data = response.json()
        print(f"Found {len(data['restaurants'])} restaurants")
        for i, restaurant in enumerate(data['restaurants'][:3]):
            print(f"{i+1}. {restaurant['name']} - {restaurant.get('rating', 'N/A')} stars")
    else:
        print("❌ Restaurant search error:", response.status_code)
        print("Error:", response.text)
        
except Exception as e:
    print("Error:", e)
