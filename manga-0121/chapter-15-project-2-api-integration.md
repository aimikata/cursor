# Chapter 15: Project 2 — Building an API Integration App

## 📖 Chapter Overview

**Chapter Title:** Project 2 — Building an API Integration App  
**Page Count:** 24-26 pages (optimized for visual learning)  
**Learning Objectives:**
- Learn how to integrate with external APIs
- Learn how to handle **error handling** and **edge cases** for API calls
- Learn how to write **tests** for API calls
- Learn **best practices** for API integration

---

## 🎬 Story Structure

### **Opening Scene (Pages 1-2): What to Build?**

**【Manga Part】**

**Setting:** Alex's apartment. After building a ToDo app in Chapter 14, Alex wants to build a more practical app.

**Manga Scene 1 (Page 1):**
- **Panel 1:** Alex says: "The ToDo app is complete, but I want to build a **more practical app**. However, I don't know **what to build**..."
- **Alex (thinking):** "An app that gets weather information, or an app that **integrates with external APIs**... But **what is an API? How do I use it?**"

**Panel 2:** David appears via video call.
- **David:** "Let's build an **API integration app**. An API is a mechanism to **integrate with external services**. For example, APIs to get weather information, APIs to get news, etc. You can build an API integration app using Cursor's **Chat** and **Composer**."
- **Alex:** "How do I build an API integration app? **What is an API? How do I use it?**"

**Panel 3:** David suggests: "Let's build it **step by step** together."
- **David:** "First, understand **what an API is**, then use Cursor's **Chat** and **Composer** to build an API integration app **step by step**. We'll learn **error handling** and **tests** together too."

**【Infographic Part】**

**Pages 1-2, bottom:**
- **What we'll build in this chapter:** API integration app (app that gets weather information)
- **What we'll learn in this chapter:** What an API is, how to integrate with external APIs, how to handle **error handling** and **edge cases**, how to write **tests** for API calls, **best practices** for API integration
- **What to use:** Cursor's **Chat** (`⌘+L` / `Ctrl+L`), **Composer** (`⌘+I` / `Ctrl+I`), Python's `requests` library, APIs (e.g., OpenWeatherMap API)
- **Flow:** Understand what an API is in 15.1 → Handle error handling and edge cases in 15.2 → Write tests for API calls in 15.3 → Learn best practices for API integration in 15.4

---

### **Section 15.1: Integrating with External APIs (Pages 3-10)**

**【Manga Part】**

**Manga Scene 2 (Page 3):**
- **Panel 1:** David explains: "First, let's understand **what an API is**."
- **David:** "An API is a mechanism to **integrate with external services**. For example, APIs to get weather information, APIs to get news, etc. Using APIs lets you **get data from external services without preparing data yourself**."

**Panel 2:** Alex asks: "**What is an API? How do I use it?**"
- **David:** "An API is a mechanism that sends **HTTP requests** and receives **JSON data**. Using Python's `requests` library makes it easy to call APIs. Ask Cursor's **Chat** or **Composer** to 'create an API integration app that gets weather information' and it will create an API integration app."

**Panel 3:** Alex leans forward: "I want to actually build an API integration app in `daily_log`."
- **David:** "Let's ask Cursor's **Chat** 'I want to build an API integration app that gets weather information. Use OpenWeatherMap API. Please suggest a project structure'. Then experience the flow of creating an API integration app with **Composer**."

**【Infographic Part】**

**Pages 3-4:**
- **What is an API:**
  1. **API (Application Programming Interface)**: Mechanism to integrate with external services
  2. **HTTP request**: Send requests to API (e.g., `GET https://api.example.com/data`)
  3. **JSON data**: Receive data from API (e.g., `{"temperature": 25, "humidity": 60}`)

- **Benefits of using APIs:**
  - **Get data from external services without preparing data yourself**
  - **Get latest data**
  - **Delegate complex processing** to external services

**Pages 5-6:**
- **Practice: Consult about API integration app plan in Chat (Pages 5-6)**

**【Manga Part】**

**Manga Scene 3 (Page 5):**
- **Panel 1:** Alex opens Cursor's **Chat** (`⌘+L` / `Ctrl+L`) and types **"I want to build an API integration app that gets weather information. Use OpenWeatherMap API. Please suggest a project structure"**.
- **Alex (input):** "I want to build an API integration app that gets weather information. Use OpenWeatherMap API. Please suggest a project structure"

**Panel 2:** Cursor suggests a project structure.
- **Cursor (response):** "I'll suggest a project structure for an API integration app that gets weather information:
  ```
  weather_app/
  ├── weather.py       # Main code
  ├── config.py        # API key settings
  └── test_weather.py  # Test code
  ```
  
  `weather.py` will implement the following features:
  - `get_weather(city)`: Get weather information for specified city
  - `main()`: Main processing
  ```"

**Panel 3:** Alex is worried: "A project structure was suggested, but I don't understand **what is an API? How do I use it?**..."
- **David:** "It's okay. Instruct Cursor's **Composer** 'Create a `weather_app` folder and create a `weather.py` file. Use OpenWeatherMap API to implement a feature that gets weather information for a specified city' and it will create an API integration app."

**【Infographic Part】**

**Pages 5-6:**
- **Steps to consult about API integration app plan in Chat:**
  1. **Open Chat:** Open Chat (`⌘+L` / `Ctrl+L`)
  2. **Enter question:** Type **"I want to build an API integration app that gets weather information. Use OpenWeatherMap API. Please suggest a project structure"**
  3. **Click Send button:** Click the **Send** button
  4. **Check Cursor's suggestion:** Cursor suggests a project structure. **Always check with your eyes** and understand **what the structure is**

**Pages 7-8:**
- **Practice: Create API integration app with Composer (Pages 7-8)**

**【Manga Part】**

**Manga Scene 4 (Page 7):**
- **Panel 1:** Alex opens Cursor's **Composer** (`⌘+I` / `Ctrl+I`) and instructs **"Create a `weather_app` folder and create a `weather.py` file. Use OpenWeatherMap API to implement a feature that gets weather information for a specified city"**.
- **Alex (input):** "Create a `weather_app` folder and create a `weather.py` file. Use OpenWeatherMap API to implement a feature that gets weather information for a specified city"

**Panel 2:** Composer creates an API integration app.
- **Composer (suggestion):** Creates a `weather_app` folder and creates a `weather.py` file:
  ```python
  # weather.py - API integration app that gets weather information
  import requests
  import json
  import os
  
  API_KEY = os.getenv("OPENWEATHER_API_KEY", "your_api_key_here")
  BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
  
  def get_weather(city):
      """Get weather information for specified city"""
      params = {
          "q": city,
          "appid": API_KEY,
          "units": "metric",
          "lang": "ja"
      }
      response = requests.get(BASE_URL, params=params)
      if response.status_code == 200:
          data = response.json()
          return {
              "city": data["name"],
              "temperature": data["main"]["temp"],
              "description": data["weather"][0]["description"],
              "humidity": data["main"]["humidity"]
          }
      else:
          return None
  
  def main():
      """Main processing"""
      import sys
      if len(sys.argv) < 2:
          print("Usage: python weather.py \"city name\"")
          return
      city = sys.argv[1]
      weather = get_weather(city)
      if weather:
          print(f"City: {weather['city']}")
          print(f"Temperature: {weather['temperature']}°C")
          print(f"Weather: {weather['description']}")
          print(f"Humidity: {weather['humidity']}%")
      else:
          print("Could not get weather information")
  
  if __name__ == "__main__":
      main()
  ```

**Panel 3:** Alex says: "I want to check the generated code."
- **David:** "**Always check with your eyes** the code displayed in the Composer panel and understand **what features are implemented**. Then click the **Accept** button to create the API integration app."

**【Infographic Part】**

**Pages 7-8:**
- **Steps to create API integration app with Composer:**
  1. **Open Composer:** Open Composer (`⌘+I` / `Ctrl+I`)
  2. **Enter instruction:** Instruct **"Create a `weather_app` folder and create a `weather.py` file. Use OpenWeatherMap API to implement a feature that gets weather information for a specified city"**
  3. **Click Generate button:** Click the **Generate** button
  4. **Check generated code:** **Always check with your eyes** the code displayed in the Composer panel. Understand **what features are implemented**
  5. **Click Accept button:** Click the **Accept** button to create the API integration app

**Pages 9-10:**
- **How to use the API integration app:**
  ```bash
  # Set API key in environment variable
  export OPENWEATHER_API_KEY="your_api_key_here"
  
  # Get weather information
  python weather.py "Tokyo"
  ```

---

### **Section 15.2: Error Handling and Edge Cases (Pages 11-16)**

**【Manga Part】**

**Manga Scene 5 (Page 11):**
- **Panel 1:** Alex runs `python weather.py "Tokyo"` in the terminal. An error appears.
- **Error message (example):**
  ```
  Traceback (most recent call last):
    File "weather.py", line 25, in get_weather
      data = response.json()
  requests.exceptions.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
  ```
- **Alex:** "An error appeared... I don't know **what to do**..."

**Panel 2:** David explains: "In API calls, **error handling** is important."
- **David:** "In API calls, various errors can occur: **network errors**, **API errors**, **data doesn't exist**, etc. Adding **error handling** lets you **handle errors safely**."

**Panel 3:** Alex asks: "How do I add **error handling**?"
- **David:** "Ask Cursor's **Chat** or **Composer** 'Add error handling for API calls to `weather.py`. Add handling for network errors, API errors, and when data doesn't exist' and it will add error handling."

**【Infographic Part】**

**Pages 11-12:**
- **Errors that occur in API calls:**
  | Error | Cause | Solution |
  |-------|-------|----------|
  | **Network error** | No internet connection | **Catch errors with `try-except` blocks** |
  | **API error** | Invalid API key, invalid request | **Check `response.status_code`** |
  | **Data doesn't exist** | Specified city doesn't exist | **Check `response.json()` result** |

**Pages 13-14:**
- **Practice: Consult about error handling in Chat (Pages 13-14)**

**【Manga Part】**

**Manga Scene 6 (Page 13):**
- **Panel 1:** Alex opens Cursor's **Chat** (`⌘+L` / `Ctrl+L`) and types **"Add error handling for API calls to `weather.py`. Add handling for network errors, API errors, and when data doesn't exist"**.
- **Alex (input):** "Add error handling for API calls to `weather.py`. Add handling for network errors, API errors, and when data doesn't exist"

**Panel 2:** Cursor displays error handling suggestions.
- **Cursor (response):** "I'll add the following error handling to `weather.py`:
  ```python
  def get_weather(city):
      """Get weather information for specified city"""
      try:
          params = {
              "q": city,
              "appid": API_KEY,
              "units": "metric",
              "lang": "ja"
          }
          response = requests.get(BASE_URL, params=params, timeout=10)
          
          if response.status_code == 200:
              data = response.json()
              return {
                  "city": data["name"],
                  "temperature": data["main"]["temp"],
                  "description": data["weather"][0]["description"],
                  "humidity": data["main"]["humidity"]
              }
          elif response.status_code == 404:
              return {"error": "City not found"}
          else:
              return {"error": f"API error: {response.status_code}"}
      except requests.exceptions.RequestException as e:
          return {"error": f"Network error: {e}"}
      except json.JSONDecodeError:
          return {"error": "Failed to parse data"}
  ```"

**Panel 3:** Alex is worried: "Error handling was added, but I don't understand **what errors are being handled**..."
- **David:** "It's okay. Ask Cursor's **Chat** **'What errors is this error handling handling?'** and it will explain clearly."

**【Infographic Part】**

**Pages 13-14:**
- **Steps to consult about error handling in Chat:**
  1. **Open Chat:** Open Chat (`⌘+L` / `Ctrl+L`)
  2. **Enter question:** Type **"Add error handling for API calls to `weather.py`. Add handling for network errors, API errors, and when data doesn't exist"**
  3. **Click Send button:** Click the **Send** button
  4. **Check Cursor's suggestion:** Cursor displays error handling suggestions. **Always check with your eyes** and understand **what errors are being handled**

**Pages 15-16:**
- **Practice: Add error handling with Composer (Pages 15-16)**

**【Manga Part】**

**Manga Scene 7 (Page 15):**
- **Panel 1:** Alex opens Cursor's **Composer** (`⌘+I` / `Ctrl+I`) and instructs **"Add error handling for API calls to `weather.py`. Add handling for network errors, API errors, and when data doesn't exist"**.
- **Alex (input):** "Add error handling for API calls to `weather.py`. Add handling for network errors, API errors, and when data doesn't exist"

**Panel 2:** Composer adds error handling.
- **Composer (suggestion):** Adds the following error handling to `weather.py`:
  ```python
  def get_weather(city):
      """Get weather information for specified city"""
      try:
          params = {
              "q": city,
              "appid": API_KEY,
              "units": "metric",
              "lang": "ja"
          }
          response = requests.get(BASE_URL, params=params, timeout=10)
          
          if response.status_code == 200:
              data = response.json()
              return {
                  "city": data["name"],
                  "temperature": data["main"]["temp"],
                  "description": data["weather"][0]["description"],
                  "humidity": data["main"]["humidity"]
              }
          elif response.status_code == 404:
              return {"error": "City not found"}
          else:
              return {"error": f"API error: {response.status_code}"}
      except requests.exceptions.RequestException as e:
          return {"error": f"Network error: {e}"}
      except json.JSONDecodeError:
          return {"error": "Failed to parse data"}
  ```

**Panel 3:** Alex says: "I want to check the generated code."
- **David:** "**Always check with your eyes** the code displayed in the Composer panel and understand **what errors are being handled**. Then click the **Accept** button to add error handling."

**【Infographic Part】**

**Pages 15-16:**
- **Steps to add error handling with Composer:**
  1. **Open Composer:** Open Composer (`⌘+I` / `Ctrl+I`)
  2. **Enter instruction:** Instruct **"Add error handling for API calls to `weather.py`. Add handling for network errors, API errors, and when data doesn't exist"**
  3. **Click Generate button:** Click the **Generate** button
  4. **Check generated code:** **Always check with your eyes** the code displayed in the Composer panel. Understand **what errors are being handled**
  5. **Click Accept button:** Click the **Accept** button to add error handling

---

### **Section 15.3: Writing Tests for API Calls (Pages 17-20)**

**【Manga Part】**

**Manga Scene 8 (Page 17):**
- **Panel 1:** David explains: "Let's write **tests** for API calls."
- **David:** "Writing tests for API calls lets you **verify that code isn't broken when APIs change**. Ask Cursor's **Chat** or **Composer** to 'create `test_weather.py` and test API calls in `weather.py`' and it will generate test code."

**Panel 2:** Alex asks: "How do I write tests for API calls?"
- **David:** "For API call tests, use **mocks**. Mocks are a mechanism that **returns test data without calling actual APIs**. Cursor generates them, so you just need to **understand test results**."

**Panel 3:** Alex leans forward: "I want to actually write tests for API calls in `weather_app`."
- **David:** "Let's ask Cursor's **Chat** 'create `test_weather.py` and test API calls in `weather.py`. Use `pytest` and `unittest.mock` to write tests using mocks'. Then experience the flow of creating test files with **Composer**."

**【Infographic Part】**

**Pages 17-18:**
- **Steps to write tests for API calls:**
  1. **Ask in Chat:** Open Chat (`⌘+L` / `Ctrl+L`) and ask **"Create `test_weather.py` and test API calls in `weather.py`. Use `pytest` and `unittest.mock` to write tests using mocks"**
  2. **Check Cursor's suggestion:** Cursor displays test code suggestions. **Always check with your eyes** and understand **what they test**
  3. **Generate with Composer:** Open Composer (`⌘+I` / `Ctrl+I`) and instruct **"Create `test_weather.py` and test API calls in `weather.py`"**
  4. **Run tests:** Run `pytest test_weather.py` in the terminal

**Pages 19-20:**
- **Example of tests using mocks:**
  ```python
  import pytest
  from unittest.mock import patch, Mock
  from weather import get_weather
  
  @patch('weather.requests.get')
  def test_get_weather_success(mock_get):
      """Test successful API call"""
      mock_response = Mock()
      mock_response.status_code = 200
      mock_response.json.return_value = {
          "name": "Tokyo",
          "main": {"temp": 25, "humidity": 60},
          "weather": [{"description": "Clear"}]
      }
      mock_get.return_value = mock_response
      
      result = get_weather("Tokyo")
      assert result["city"] == "Tokyo"
      assert result["temperature"] == 25
  ```

---

### **Section 15.4: Best Practices for API Integration (Pages 21-24)**

**【Manga Part】**

**Manga Scene 9 (Page 21):**
- **Panel 1:** David explains: "Let's learn **best practices** for API integration."
- **David:** "In API integration, it's important to **save API keys in environment variables**, **set timeouts for requests**, **add error handling**, **write tests**, etc."

**Panel 2:** Alex asks: "What specifically are **best practices** for API integration?"
- **David:** "(1) **Save API keys in environment variables** (for security), (2) **set timeouts for requests** (to prevent network errors), (3) **add error handling** (to handle errors safely), (4) **write tests** (to verify code isn't broken when APIs change)."

**Panel 3:** Alex leans forward: "I want to actually apply best practices in `weather_app`."
- **David:** "Let's ask Cursor's **Chat** 'Apply best practices for API integration to `weather.py`. Save API keys in environment variables, set timeouts for requests, add error handling, etc.'"

**【Infographic Part】**

**Pages 21-22:**
- **Best practices for API integration:**
  1. **Save API keys in environment variables**: For security
  2. **Set timeouts for requests**: To prevent network errors
  3. **Add error handling**: To handle errors safely
  4. **Write tests**: To verify code isn't broken when APIs change

**Pages 23-24:**
- **Example of applying best practices:**
  ```python
  # Save API key in environment variable
  API_KEY = os.getenv("OPENWEATHER_API_KEY")
  
  # Set timeout for request
  response = requests.get(BASE_URL, params=params, timeout=10)
  
  # Add error handling
  try:
      # API call
  except requests.exceptions.RequestException as e:
      # Error handling
  ```

---

## 📝 Chapter Summary (Pages 25-26)

**【Manga Part】**

**Manga Scene 10 (Page 25):**
- **Panel 1:** David says: "In this chapter, we (1) learned how to integrate with external APIs, (2) learned how to handle **error handling** and **edge cases** for API calls, (3) learned how to write **tests** for API calls, (4) learned **best practices** for API integration. That's what we covered."
- **Alex:** "The API integration app is complete! I also added **error handling** and **tests**."

**Panel 2:** Alex reflects: "But at first I didn't understand **what is an API? How do I use it?**..."
- **David:** "It's okay. If we do it **step by step** together, you'll understand **what an API is** and **how to use it**. If we learn **error handling** and **tests** together, you can build **practical API integration apps**."

**Panel 3:** Alex asks: "What do we learn next?"
- **David:** "Next, let's build a **database app**. Let's learn how to save and retrieve data in a database."

**【Infographic Part】**

**Pages 25-26:**
- **What we learned in this chapter:**
  - ✅ Learned how to integrate with external APIs
  - ✅ Learned how to handle **error handling** and **edge cases** for API calls
  - ✅ Learned how to write **tests** for API calls
  - ✅ Learned **best practices** for API integration

- **Best practices for API integration:**
  1. **Save API keys in environment variables**: For security
  2. **Set timeouts for requests**: To prevent network errors
  3. **Add error handling**: To handle errors safely
  4. **Write tests**: To verify code isn't broken when APIs change

- **Next chapter:** Chapter 16 "Project 3 — Building a Database App"

---

**Chapter 15 - Complete**
