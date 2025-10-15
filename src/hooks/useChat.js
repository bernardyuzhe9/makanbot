"use client";
import { useState, useCallback } from "react";

export function useChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Hi! I'm MakanBot. What are you in the mood for today? I can help you find great food nearby!",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);

  const sendMessage = useCallback(async (message, location = "1.3521,103.8198") => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/gemini-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          location,
          radius_meters: 5000,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setRestaurants(data.restaurants || []);

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
        content: "Hi! I'm MakanBot. What are you in the mood for today? I can help you find great food nearby!",
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
