// src/components/NewsCard.js
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NewsCard = ({ article, onOpen, onToggleFavorite, isFavorite }) => {
  const { colors } = useTheme();

  return (
    <Pressable
      android_ripple={{ color: '#ffffff10' }}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, opacity: pressed ? 0.96 : 1 },
      ]}
      onPress={() => onOpen(article)}
      accessibilityLabel={`Open article ${article.title}`}
      accessibilityRole="button"
    >
      {article.urlToImage ? (
        <Image source={{ uri: article.urlToImage }} style={styles.image} />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.primary + '22' }]}>
          <Icon name="newspaper-variant-multiple" size={48} color={colors.primary} />
        </View>
      )}

      <View style={styles.content}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {article.title}
        </Text>

        <Text style={[styles.desc, { color: colors.muted }]} numberOfLines={3}>
          {article.description || article.content || ''}
        </Text>

        <View style={styles.row}>
          <Text style={[styles.source, { color: colors.muted }]} numberOfLines={1}>
            {article.source?.name || 'Unknown source'}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => onToggleFavorite(article)}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Icon
                name={isFavorite ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isFavorite ? colors.accent : colors.muted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onOpen(article, { shareOnly: true })}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Share article"
            >
              <Icon name="share-variant" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 14,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  image: {
    height: 170,
    width: '100%',
  },
  imagePlaceholder: {
    height: 170,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});

export default NewsCard;
