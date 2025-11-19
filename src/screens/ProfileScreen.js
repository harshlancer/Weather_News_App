// src/screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritesKey = 'news_favorites_v1';

const ProfileScreen = ({ navigation }) => {
  const { colors, theme, toggleTheme, units, toggleUnits } = useTheme();
  const user = auth().currentUser;
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const fav = await AsyncStorage.getItem(FavoritesKey);
        if (fav) setFavCount(Object.keys(JSON.parse(fav)).length);
      } catch (e) {}
    })();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await auth().signOut();
        },
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholder, { backgroundColor: colors.primary }]}>
            <Text style={styles.placeholderText}>{(user?.displayName?.[0] || 'U').toUpperCase()}</Text>
          </View>
        )}

        <Text style={[styles.name, { color: colors.text }]}>{user?.displayName || 'Guest'}</Text>
        <Text style={[styles.email, { color: colors.muted }]}>{user?.email || 'No email'}</Text>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={toggleTheme}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Switch Theme</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accent }]} onPress={toggleUnits}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Units: {units.toUpperCase()}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.logoutBtn]} onPress={handleLogout}>
          <Text style={[styles.logoutText]}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={{ color: colors.primary }}>Back to Home</Text>
        </TouchableOpacity>

        <Text style={{ marginTop: 12, color: colors.muted }}>{favCount} favorites saved</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 18, borderRadius: 16, padding: 22, alignItems: 'center', elevation: 6 },
  avatar: { width: 110, height: 110, borderRadius: 60, marginBottom: 12 },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#fff', fontSize: 36, fontWeight: '900' },
  name: { fontSize: 22, fontWeight: '900' },
  email: { fontSize: 14, marginBottom: 14 },
  actionBtn: { marginTop: 12, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12 },
  logoutBtn: { marginTop: 12, backgroundColor: '#dc3545', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  logoutText: { color: '#fff', fontWeight: '800' },
  backBtn: { marginTop: 8, padding: 10 },
});

export default ProfileScreen;
