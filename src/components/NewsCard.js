// src/components/NewsCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const NewsCard = ({ article }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]}>
      {article.urlToImage && (
        <Image source={{ uri: article.urlToImage }} style={styles.image} />
      )}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={{ color: '#666', marginTop: 8 }} numberOfLines={3}>
          {article.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { margin: 12, borderRadius: 12, overflow: 'hidden', elevation: 5 },
  image: { height: 180, width: '100%' },
  content: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold' },
});

export default NewsCard;