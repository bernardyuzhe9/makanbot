#!/usr/bin/env python3
"""
Test Google Maps API integration for restaurant search
"""

import requests
import json

# Test the Google Maps API directly
def test_maps_api():
    api_key = "AIzaSyCphF8h1fw6g2n9ys60PX3Oa-by9h7lUcU"
    location = "3.1478,101.7003"  # Bukit Bintang coordinates
    keyword = "thai restaurant"
    radius = 2000
    
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": location,
        "radius": radius,
        "type": "restaurant",
        "keyword": keyword,
        "key": api_key
    }
    
    print(f"🔍 Testing Google Maps API...")
    print(f"📍 Location: {location}")
    print(f"🍜 Keyword: {keyword}")
    print(f"📏 Radius: {radius}m")
    print()
    
    try:
        response = requests.get(url, params=params)
        print(f"📡 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📊 API Status: {data.get('status')}")
            
            if data.get('status') == 'OK':
                results = data.get('results', [])
                print(f"✅ Found {len(results)} restaurants!")
                print()
                
                for i, place in enumerate(results[:3], 1):
                    print(f"🏪 Restaurant {i}:")
                    print(f"   Name: {place.get('name')}")
                    print(f"   Rating: {place.get('rating', 'N/A')}")
                    print(f"   Vicinity: {place.get('vicinity')}")
                    print(f"   Price Level: {place.get('price_level', 'N/A')}")
                    print(f"   Place ID: {place.get('place_id')}")
                    print(f"   Photos: {len(place.get('photos', []))} available")
                    print(f"   Open Now: {place.get('opening_hours', {}).get('open_now', 'Unknown')}")
                    print()
            else:
                print(f"❌ API Error: {data.get('error_message', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_maps_api()
