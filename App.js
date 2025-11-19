// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ArticleDetailScreen from './src/screens/ArticleDetailScreen';
import { ThemeProvider } from './src/context/ThemeContext';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const setupFCM = async () => {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          const token = await messaging().getToken();
          console.log('FCM token', token);
        }
      } catch (e) {
        console.warn('FCM error', e);
      }

      const unsubForeground = messaging().onMessage(async remoteMessage => {
        Alert.alert(remoteMessage.notification?.title || 'Notification', remoteMessage.notification?.body || '');
      });

      const unsubBackground = messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Opened from background notification', remoteMessage);
      });

      messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage) console.log('Initial notification opened app', remoteMessage);
      });

      return () => {
        unsubForeground();
        unsubBackground();
      };
    };

    setupFCM();

    const subscriber = auth().onAuthStateChanged((u) => {
      setUser(u);
      if (initializing) setInitializing(false);
    });

    return subscriber;
  }, []);

  if (initializing) return null;

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
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
