"use client";
import { useState, useCallback } from "react";

// Function to parse places from AI response
function parsePlacesFromResponse(text) {
  const placeRegex = /\*\*(.*?)\*\*\s*-\s*(.*?)(?=\*\*|$)/g;
  const places = [];
  let match;
  
  while ((match = placeRegex.exec(text)) !== null) {
    places.push({
      name: match[1].trim(),
      description: match[2].trim(),
      id: Date.now() + Math.random()
    });
  }
  
  return places;
}

      // Function to dynamically detect location from user message using Google Geocoding API
      async function detectLocation(message) {
        const lowerMessage = message.toLowerCase();
        
        // Extract potential location from message using natural language patterns
        const locationPatterns = [
          // "in [location]" pattern - improved to capture multi-word locations
          /(?:in|at|near|around)\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|,|\.|!|\?|under|below|above)/gi,
          // "restaurant in [location]" pattern  
          /(?:restaurant|food|dining)\s+(?:in|at|near|around)\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|,|\.|!|\?|under|below|above)/gi,
          // "find [cuisine] in [location]" pattern
          /(?:find|looking for|want|need)\s+(?:[^,.\n]+?)\s+(?:in|at|near|around)\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|,|\.|!|\?|under|below|above)/gi
        ];
        
        let potentialLocation = null;
        
        // Try to extract location using patterns
        for (const pattern of locationPatterns) {
          const matches = [...message.matchAll(pattern)];
          if (matches.length > 0) {
            // Get the first capture group (location) and clean it up
            potentialLocation = matches[0][1].trim();
            // Remove common words that might be captured
            potentialLocation = potentialLocation.replace(/\b(restaurant|food|dining|under|below|above|rm|price|budget)\b/gi, '').trim();
            if (potentialLocation.length > 2) {
              break;
            }
          }
        }
        
        // If no pattern match, try to find location-like words (2+ words, capitalized)
        if (!potentialLocation) {
          const words = message.split(/\s+/);
          for (let i = 0; i < words.length; i++) {
            const word = words[i];
            // Look for capitalized words that might be locations
            if (word.length > 2 && /^[A-Z]/.test(word)) {
              // Check if next word is also capitalized (likely a location)
              if (i + 1 < words.length && /^[A-Z]/.test(words[i + 1])) {
                potentialLocation = `${word} ${words[i + 1]}`;
                break;
              } else if (word.length > 4) {
                potentialLocation = word;
                break;
              }
            }
          }
        }
  
  if (potentialLocation) {
    try {
      console.log(`🔍 Geocoding potential location: ${potentialLocation}`);
      
      // Use Google Geocoding API to get coordinates
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(potentialLocation + ', Malaysia')}&key=AIzaSyCspqK3X53vjzIceGeK0qjGK190cnFgNb8`
      );
      
      if (geocodeResponse.ok) {
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.status === 'OK' && geocodeData.results.length > 0) {
          const location = geocodeData.results[0].geometry.location;
          const coordinates = `${location.lat},${location.lng}`;
          
          console.log(`✅ Geocoded ${potentialLocation} -> ${coordinates}`);
          return {
            coordinates,
            locationName: potentialLocation,
            formattedAddress: geocodeData.results[0].formatted_address
          };
        } else {
          console.log(`❌ Geocoding failed for ${potentialLocation}:`, geocodeData.status);
        }
      } else {
        console.log(`❌ Geocoding API error:`, geocodeResponse.status);
      }
    } catch (error) {
      console.log(`❌ Geocoding error for ${potentialLocation}:`, error);
    }
  }
  
  // Fallback to default KL coordinates
  console.log(`📍 No specific location detected, using default KL coordinates`);
  return {
    coordinates: "3.1390,101.6869", // Default Kuala Lumpur coordinates
    locationName: "Kuala Lumpur",
    formattedAddress: "Kuala Lumpur, Malaysia"
  };
}

// Function to extract search keywords from user message
function extractSearchKeywords(message) {
  const lowerMessage = message.toLowerCase();
  const keywords = [];
  
  // Cuisine types
  const cuisines = [
    'thai', 'chinese', 'japanese', 'korean', 'indian', 'italian', 'mexican',
    'malay', 'indonesian', 'vietnamese', 'western', 'halal', 'vegetarian',
    'sushi', 'ramen', 'pizza', 'burger', 'steak', 'seafood', 'chicken',
    'sashimi', 'tempura', 'teriyaki', 'yakitori', 'udon', 'soba', 'bento',
    'japanese food', 'japanese restaurant', 'japanese cuisine'
  ];
  
  // Food types
  const foodTypes = [
    'restaurant', 'cafe', 'coffee', 'bakery', 'fast food', 'fine dining',
    'hawker', 'food court', 'street food', 'buffet', 'dim sum'
  ];
  
  // Check for cuisine matches
  for (const cuisine of cuisines) {
    if (lowerMessage.includes(cuisine)) {
      keywords.push(cuisine);
    }
  }
  
  // Check for food type matches
  for (const foodType of foodTypes) {
    if (lowerMessage.includes(foodType)) {
      keywords.push(foodType);
    }
  }
  
  // If no specific keywords found, use the original message
  if (keywords.length === 0) {
    keywords.push('restaurant');
  }
  
  // For Thai restaurants, be more specific
  if (lowerMessage.includes('thai')) {
    keywords.push('thai restaurant');
  }
  
  return keywords;
}

// Function to extract price filter from user message
function extractPriceFilter(message) {
  const lowerMessage = message.toLowerCase();
  
  // Look for price-related keywords
  const pricePatterns = [
    /under\s+rm?(\d+)/i,
    /below\s+rm?(\d+)/i,
    /less\s+than\s+rm?(\d+)/i,
    /budget\s+rm?(\d+)/i,
    /within\s+rm?(\d+)/i,
    /max\s+rm?(\d+)/i,
    /maximum\s+rm?(\d+)/i
  ];
  
  for (const pattern of pricePatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return null;
}

export function useChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Hi! I'm MakanBot. What are you in the mood for today? I can help you find great food in your area!",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);

  const sendMessage = useCallback(async (message, defaultLocation = "3.1390,101.6869") => {
    if (!message.trim()) return;

    // Add user message first
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Dynamically detect location using geocoding API
      const locationInfo = await detectLocation(message);
      const location = locationInfo.coordinates;
      const locationName = locationInfo.locationName;
      
      console.log("📍 Detected location:", locationName, "->", location, "for message:", message);

      // Call Google Maps API first to get actual restaurant data
      let restaurants = [];
      try {
        // Extract keywords from the user message for better search
        const searchKeywords = extractSearchKeywords(message);
        let searchQuery = searchKeywords.length > 0 ? searchKeywords.join(' ') : 'restaurant';
        
        // Make search more specific for certain cuisines
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('japanese') || lowerMessage.includes('sushi') || lowerMessage.includes('ramen')) {
          searchQuery = 'japanese restaurant';
        } else if (lowerMessage.includes('korean') || lowerMessage.includes('kbbq') || lowerMessage.includes('kimchi')) {
          searchQuery = 'korean restaurant';
        } else if (lowerMessage.includes('thai')) {
          searchQuery = 'thai restaurant';
        } else if (lowerMessage.includes('chinese')) {
          searchQuery = 'chinese restaurant';
        }
        
        console.log("🎯 Final search query:", searchQuery);
        
        // Use dynamic radius based on location type (default 5000m)
        let radius = 5000; // Default radius for most areas
         
         console.log("🔍 Searching for:", searchQuery);
         console.log("📍 Location:", location);
         console.log("📏 Radius:", radius);
         const mapsResponse = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant&keyword=${encodeURIComponent(searchQuery)}&key=AIzaSyCphF8h1fw6g2n9ys60PX3Oa-by9h7lUcU`);
        
        if (mapsResponse.ok) {
          const mapsData = await mapsResponse.json();
          console.log("📊 Maps API Response:", mapsData);
               if (mapsData.status === 'OK' && mapsData.results) {
                 restaurants = mapsData.results.slice(0, 5).map(place => ({
                   name: place.name,
                   rating: place.rating,
                   vicinity: place.vicinity,
                   address: place.vicinity,
                   place_id: place.place_id,
                   price_level: place.price_level,
                   photos: place.photos ? place.photos.slice(0, 1) : [],
                   opening_hours: place.opening_hours,
                   // Store all available price-related data from Google Maps
                   price_data: {
                     price_level: place.price_level,
                     // Add any other price-related fields that might be available
                     user_ratings_total: place.user_ratings_total,
                     business_status: place.business_status
                   }
                 }));
                 console.log("✅ Found restaurants:", restaurants.length);
                 console.log("Restaurant names:", restaurants.map(r => r.name));
                 console.log("Full restaurant data:", restaurants);
                 
                 // Apply price filter if specified in the message
                 const maxPrice = extractPriceFilter(message);
                 if (maxPrice) {
                   console.log(`💰 Filtering restaurants under RM${maxPrice}`);
                   restaurants = restaurants.filter(restaurant => {
                     if (restaurant.price_level === null || restaurant.price_level === undefined) {
                       return true; // Keep restaurants without price data
                     }
                     // Convert price level to max price for filtering
                     const maxPriceForLevel = {
                       0: 20,  // RM1-20
                       1: 40,  // RM20-40
                       2: 60,  // RM40-60
                       3: 80,  // RM60-80
                       4: 100  // RM80-100
                     };
                     return maxPriceForLevel[restaurant.price_level] <= maxPrice;
                   });
                   console.log(`✅ After price filtering: ${restaurants.length} restaurants under RM${maxPrice}`);
                 }
               } else {
                 console.log("❌ Maps API returned:", mapsData.status, mapsData.error_message);
               }
        } else {
          console.log("❌ Maps API HTTP error:", mapsResponse.status);
        }
      } catch (mapsError) {
        console.log("❌ Maps API error (non-critical):", mapsError);
         // Add fallback restaurants based on cuisine type
         const lowerMessage = message.toLowerCase();
         if (lowerMessage.includes('japanese') || lowerMessage.includes('sushi') || lowerMessage.includes('ramen')) {
           restaurants = [
             {
               name: "Sushi Tei",
               rating: 4.2,
               vicinity: "Taman Desa, Kuala Lumpur",
               address: "Taman Desa, Kuala Lumpur",
               place_id: "fallback_japanese_1",
               price_level: 3, // RM60-100 range for Japanese restaurants
               photos: [],
               opening_hours: { open_now: true }
             },
             {
               name: "Sakura Sushi",
               rating: 4.0,
               vicinity: "Taman Desa, Kuala Lumpur",
               address: "Taman Desa, Kuala Lumpur",
               place_id: "fallback_japanese_2",
               price_level: 2, // RM30-60 range for mid-range Japanese
               photos: [],
               opening_hours: { open_now: true }
             }
           ];
         } else if (lowerMessage.includes('korean') || lowerMessage.includes('kbbq') || lowerMessage.includes('kimchi')) {
           restaurants = [
             {
               name: "Seoul Garden",
               rating: 4.3,
               vicinity: "Taman Desa, Kuala Lumpur",
               address: "Taman Desa, Kuala Lumpur",
               place_id: "fallback_korean_1",
               price_level: 3, // RM60-100 range for Korean BBQ
               photos: [],
               opening_hours: { open_now: true }
             },
             {
               name: "Korean BBQ House",
               rating: 4.1,
               vicinity: "Taman Desa, Kuala Lumpur",
               address: "Taman Desa, Kuala Lumpur",
               place_id: "fallback_korean_2",
               price_level: 2, // RM30-60 range for mid-range Korean
               photos: [],
               opening_hours: { open_now: true }
             }
           ];
         } else {
           // Default fallback for other cuisines
           restaurants = [
             {
               name: "Local Restaurant",
               rating: 4.0,
               vicinity: "Taman Desa, Kuala Lumpur",
               address: "Taman Desa, Kuala Lumpur",
               place_id: "fallback_general_1",
               price_level: 2, // RM30-60 range for general restaurants
               photos: [],
               opening_hours: { open_now: true }
             }
           ];
         }
         
         // Apply price filter to fallback restaurants as well
         const maxPrice = extractPriceFilter(message);
         if (maxPrice) {
           console.log(`💰 Filtering fallback restaurants under RM${maxPrice}`);
           restaurants = restaurants.filter(restaurant => {
             if (restaurant.price_level === null || restaurant.price_level === undefined) {
               return true; // Keep restaurants without price data
             }
             // Convert price level to max price for filtering
             const maxPriceForLevel = {
               0: 20,  // RM1-20
               1: 40,  // RM20-40
               2: 60,  // RM40-60
               3: 80,  // RM60-80
               4: 100  // RM80-100
             };
             return maxPriceForLevel[restaurant.price_level] <= maxPrice;
           });
           console.log(`✅ After price filtering fallback: ${restaurants.length} restaurants under RM${maxPrice}`);
         }
         
        console.log("🔄 Using fallback restaurants:", restaurants.length);
      }

      // Now call Gemini API with actual restaurant data
      const restaurantNames = restaurants.map(r => r.name).join(", ");
      const restaurantCount = restaurants.length;
      const maxPrice = extractPriceFilter(message);
      
      // Calculate price range from Google Maps data with RM estimates
      const priceLevels = restaurants.map(r => r.price_level).filter(p => p !== undefined && p !== null);
      
      let priceRange = "NA";
      if (priceLevels.length > 0) {
        const minPrice = Math.min(...priceLevels);
        const maxPrice = Math.max(...priceLevels);
        
        // Convert Google Maps price levels to estimated RM ranges for Malaysia
        const getPriceRange = (level) => {
          switch(level) {
            case 0: return "RM1 - RM20";
            case 1: return "RM20 - RM40";
            case 2: return "RM40 - RM60";
            case 3: return "RM60 - RM80";
            case 4: return "RM80 - RM100";
            default: return "NA";
          }
        };
        
        if (minPrice === maxPrice) {
          priceRange = getPriceRange(minPrice);
        } else {
          const minRange = getPriceRange(minPrice);
          const maxRange = getPriceRange(maxPrice);
          // Extract the min and max values
          const minValue = minRange.split(' - ')[0];
          const maxValue = maxRange.includes('+') ? maxRange : maxRange.split(' - ')[1];
          priceRange = `${minValue} - ${maxValue}`;
        }
      }
      
      const geminiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyDcL7a1PVtzZBID59U7Z4iC6M9alzUwTqY", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
               text: `You are MakanBot, a helpful AI assistant specializing in food recommendations.
User query: "${message}"
User location: ${locationName} (${location})

ACTUAL RESTAURANTS FOUND: ${restaurantCount} restaurants
Restaurant names: ${restaurantNames}
Price range: ${priceRange}
${maxPrice ? `Price filter: Under RM${maxPrice}` : ''}

IMPORTANT: Use ONLY the actual restaurant names provided above. Do NOT make up restaurant names.

Provide a concise response with:
1. Brief greeting (1 line)
2. Restaurant count: "Found ${restaurantCount} restaurants in ${locationName}!"
3. Price range information: "Price range: ${priceRange}"
${maxPrice ? `4. Mention that these are under RM${maxPrice}` : ''}
5. Mention 2-3 of the ACTUAL restaurant names from the list above
6. Add brief specialties for each (e.g., "for authentic Thai food", "for seafood lovers")
7. Keep under 120 words, use emojis

Example format:
"Hello! 😋 Found ${restaurantCount} restaurants in ${locationName}! Price range: ${priceRange}. Try **${restaurantNames.split(',')[0]}** for authentic Thai food or **${restaurantNames.split(',')[1] || restaurantNames.split(',')[0]}** for great flavors. Enjoy your meal! 🍜"`
            }]
          }]
        }),
      });

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API error! status: ${geminiResponse.status}`);
      }

      const geminiData = await geminiResponse.json();
      const geminiReply = geminiData.candidates[0].content.parts[0].text;
      
      // Parse places from the response
      const places = parsePlacesFromResponse(geminiReply);

      // Add bot response with places
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: geminiReply,
        places: places,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setRestaurants(restaurants);
      console.log("Setting restaurants state:", restaurants);

    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: "Sorry, I'm having trouble connecting right now. Please try again later!",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: 1,
        type: "bot",
      content: "Hi! I'm MakanBot. What are you in the mood for today? I can help you find great food in your area!",
        timestamp: new Date(),
      },
    ]);
    setRestaurants([]);
  }, []);

  return {
    messages,
    restaurants,
    isLoading,
    sendMessage,
    clearChat,
  };
}
