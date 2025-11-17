// src/screens/LoginScreen.js
import React from 'react';
import { View, Text, StyleSheet, Alert, ImageBackground } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { useTheme } from '../context/ThemeContext';

GoogleSignin.configure({
  webClientId: '601630861402-b5083mppbbgap458dp8e5hes5gqt7ure.apps.googleusercontent.com'

});

const LoginScreen = () => {
  const { colors } = useTheme();

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Cancelled');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1501139083538-0139583c060f' }}
      style={styles.container}
    >
      <View style={[styles.overlay, { backgroundColor: colors.background + 'CC' }]}>
        <Text style={[styles.title, { color: colors.text }]}>Weather App</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>Get live weather & news</Text>
        
        <Text 
          style={[styles.googleBtn, { backgroundColor: '#4285f4' }]}
          onPress={onGoogleButtonPress}
        >
          Sign in with Google
        </Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 18, marginTop: 10, color: '#eee' },
  googleBtn: {
    marginTop: 40,
    paddingHorizontal: 30,
    paddingVertical: 15,
    color: '#fff',
    fontSize: 18,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default LoginScreen;