// notifications.js
import messaging from "@react-native-firebase/messaging";
import { Alert, Platform } from "react-native";

// 1️⃣ Ask for Notification Permission (Android 13+)
export async function requestUserPermission() {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("📌 Notification Permission Enabled");
    } else {
      Alert.alert(
        "Permission Denied",
        "Please enable notifications from settings."
      );
    }
  } catch (error) {
    console.log("Permission Error:", error);
  }
}

// 2️⃣ Get the FCM Token for this device
export async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    console.log("📌 FCM Token:", token);
    return token;
  } catch (error) {
    console.log("FCM Token Error:", error);
    return null;
  }
}

// 3️⃣ Foreground Notification Listener
export function notificationListener() {
  // Triggered when app is open
  messaging().onMessage(async (remoteMessage) => {
    console.log("🔥 Foreground Notification:", remoteMessage);

    Alert.alert(
      remoteMessage.notification.title,
      remoteMessage.notification.body
    );
  });

  // Triggered when user taps while app was in background
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log("📌 Opened Notification (Background):", remoteMessage);
  });

  // Triggered when app is opened from a quit state by tapping notification
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log("📌 Notification caused app open (Quit state):", remoteMessage);
      }
    });
}
