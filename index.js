/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';

// ← MOVE BACKGROUND HANDLER TO TOP LEVEL (GLOBAL REGISTRATION)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background Message Received:', remoteMessage);  // ← CLEAN LOG
  // Add logic: e.g., show local notif or save data
});

AppRegistry.registerComponent(appName, () => App);  // ← FIXED RETURN