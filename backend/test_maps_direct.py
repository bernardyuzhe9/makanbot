import requests

# Test Google Maps API directly
api_key = "AIzaSyCI5sTOi6L0p5KmSznFMpFBq_1fYjTk7Qk"
location = "1.3000,103.8550"
keyword = "sushi"

url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={location}&radius=5000&type=restaurant&keyword={keyword}&key={api_key}"

try:
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        print("✅ Google Maps API works!")
        print(f"Status: {data.get('status')}")
        if data.get('results'):
            print(f"Found {len(data['results'])} restaurants")
            for i, place in enumerate(data['results'][:3]):
                print(f"{i+1}. {place['name']} - {place.get('rating', 'N/A')} stars")
        else:
            print("No results found")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
