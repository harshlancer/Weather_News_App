# Weather News App 🌤️📰

A modern React Native mobile app that delivers live weather updates, personalized news feeds, and seamless user authentication. Built with Firebase for secure Google OAuth, NewsAPI for real-time headlines, and WeatherAPI for dynamic forecasts. Features dark mode, offline caching, and smooth scroll animations for an engaging UX.

## 🚀 Features
- **Google Authentication**: Secure login with Firebase Auth — stores user profile (name, email, photo) in Firestore.
- **Live News Feed**: Fetches India-focused top headlines from NewsAPI with infinite scroll, pull-to-refresh, and offline caching via AsyncStorage.
- **Dynamic Weather Dashboard**: Real-time forecasts from WeatherAPI (current temp, feels-like, humidity, description) with location detection (Geolocation).
- **Smart UI Animations**: Weather header shrinks on scroll (Animated API), parallax background effects, and dynamic backgrounds (sunny, rainy, cloudy based on forecast).
- **Dark/Light Mode**: System-sync theme toggle using React Context and Appearance API.
- **Responsive Design**: Optimized for Android/iOS with React Navigation (Stack Navigator) and gesture handling.

## 📱 Screenshots
| Login Screen | Home (Weather + News) | Profile | Dark Mode Scroll |
|--------------|-----------------------|---------|------------------|
| ![Login](screenshots/login.png) | ![Home](screenshots/home.png) | ![Profile](screenshots/profile.png) | ![Dark Scroll](screenshots/dark-scroll.png) |

## 🛠 Tech Stack
- **Frontend**: React Native 0.74.5, React Navigation, React Native Gesture Handler
- **State Management**: React Context API
- **Auth & Backend**: Firebase (Auth, Firestore)
- **APIs**: NewsAPI (news), WeatherAPI (weather)
- **Utilities**: Axios (HTTP), AsyncStorage (caching), Geolocation, Animated (UI effects), LinearGradient, ImageBackground
- **Build Tools**: Gradle 9.0.0, Hermes JS Engine


## 📦 Installation

Clone the repo: ``` clone https://github.com/yourusername/weather-news-app.git```
``` cd weather-news-app```
Install dependencies:```npm install```
## Android Setup:
Add ```google-services.json to android/app/``` (download from Firebase Console).
Update API_KEY (NewsAPI) and WEATHER_KEY (WeatherAPI) in src/screens/HomeScreen.js.
Run:```npx react-native run-android```



## 🔧 Configuration

Firebase: Enable Google Sign-In in Authentication > Sign-in method. Add SHA-1 fingerprint (from ./gradlew signingReport) in Project Settings > Your Android App.
APIs:
NewsAPI: Free key from newsapi.org/register.
WeatherAPI: Free key from weatherapi.com/signup.aspx.

Assets: Add sunny_bg.jpg, rainy_bg.jpg, cloudy_bg.jpg to src/assets/ for dynamic backgrounds.
Permissions: AndroidManifest.xml already has location perms; iOS Info.plist needs NSLocationWhenInUseUsageDescription.
