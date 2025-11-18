// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';  // FCM
import { Alert } from 'react-native';  // For foreground notifs

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { ThemeProvider } from './src/context/ThemeContext';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // FCM Setup (inside component — fixes hook error)
    const setupFCM = async () => {
      try {
        // Request permission
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('FCM Authorization status:', authStatus);
          const token = await messaging().getToken();
          console.log('FCM Token:', token);  // Save to Firestore for targeted notifs
        }
      } catch (error) {
        console.log('FCM Permission Error:', error);
      }

      // Foreground message handler (app open)
      const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
        console.log('Foreground Message:', remoteMessage);
        Alert.alert(
          remoteMessage.notification?.title || 'Notification',
          remoteMessage.notification?.body || 'New message received!'
        );
      });

      // Background/quit tap handler
      const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification Opened (Background):', remoteMessage);
        // Navigate to specific screen if needed (e.g., news detail)
      });

      messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from quit notification:', remoteMessage);
        }
      });

      return () => {
        unsubscribeForeground();
        unsubscribeBackground();
      };
    };

    setupFCM();  // Call inside useEffect

    // Existing auth listener
    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return subscriber;  // Cleanup only auth — FCM cleanup inside setupFCM
  }, []);  // Empty deps — runs once

  if (initializing) return null;

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}