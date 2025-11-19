// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ImageBackground, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { useTheme } from '../context/ThemeContext';

GoogleSignin.configure({
  webClientId: '601630861402-b5083mppbbgap458dp8e5hes5gqt7ure.apps.googleusercontent.com',
});

const LoginScreen = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const onGoogleButtonPress = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Cancelled');
      } else {
        Alert.alert('Sign-in error', error.message || 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1501139083538-0139583c060f' }} style={styles.container} resizeMode="cover">
      <View style={[styles.overlay, { backgroundColor: colors.background + 'CC' }]}>
        <Text style={[styles.title, { color: colors.text }]}>Weather · News</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Live weather + top headlines, beautifully designed</Text>

        <TouchableOpacity
          style={[styles.googleBtn, { backgroundColor: '#4285f4' }]}
          onPress={onGoogleButtonPress}
          accessibilityRole="button"
          accessibilityLabel="Sign in with Google"
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.googleText}>Sign in with Google</Text>}
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  title: { fontSize: 42, fontWeight: '900', letterSpacing: 0.5 },
  subtitle: { fontSize: 16, marginTop: 10, textAlign: 'center', maxWidth: 320 },
  googleBtn: { marginTop: 28, paddingHorizontal: 26, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  googleText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

export default LoginScreen;
