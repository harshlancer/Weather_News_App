// src/screens/ProfileScreen.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useTheme } from '../context/ThemeContext';

const ProfileScreen = ({ navigation }) => {
  const { colors, theme, toggleTheme } = useTheme();
  const user = auth().currentUser;

  const handleLogout = async () => {
    try {
      await auth().signOut();
      Alert.alert('Logged out', 'See you soon!');
    } catch (error) {
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {/* User Photo or Initial */}
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholder]}>
            <Text style={styles.placeholderText}>
              {user?.displayName?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
        )}

        {/* Name & Email */}
        <Text style={[styles.name, { color: colors.text }]}>
          {user?.displayName || 'Guest User'}
        </Text>
        <Text style={[styles.email, { color: '#666' }]}>
          {user?.email || 'No email'}
        </Text>

        {/* Theme Toggle */}
        <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme}>
          <Text style={styles.themeText}>
            Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
          </Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Back to Home */}
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  placeholder: {
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 24,
  },
  themeBtn: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  themeText: {
    fontSize: 16,
    color: '#333',
  },
  logoutBtn: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backBtn: {
    padding: 10,
  },
  backText: {
    color: '#007bff',
    fontSize: 16,
  },
});

export default ProfileScreen;