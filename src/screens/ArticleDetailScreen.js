// src/screens/ArticleDetailScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Share,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const ArticleDetailScreen = ({route, navigation}) => {
  const {colors} = useTheme();
  const {article} = route.params;

  const openWeb = async () => {
    if (!article.url) return;
    const supported = await Linking.canOpenURL(article.url);
    if (supported) {
      await Linking.openURL(article.url);
    } else {
      alert('Cannot open the article URL.');
    }
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\nRead more: ${article.url}`,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}>
      {article.urlToImage && (
        <Image source={{uri: article.urlToImage}} style={styles.image} />
      )}
      <View style={[styles.inner, {backgroundColor: colors.card}]}>
        <Text style={[styles.title, {color: colors.text}]}>
          {article.title}
        </Text>
        <Text style={[styles.meta, {color: colors.muted}]}>
          {article.source?.name} •{' '}
          {new Date(article.publishedAt).toLocaleString()}
        </Text>

        <Text style={[styles.content, {color: colors.text}]}>
          {article.content ||
            article.description ||
            'Full article available on the web.'}
        </Text>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, {borderColor: colors.primary}]}
            onPress={openWeb}>
            <Icon name="open-in-new" size={18} color={colors.primary} />
            <Text style={[styles.buttonText, {color: colors.primary}]}>
              Open in browser
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, {borderColor: colors.accent}]}
            onPress={onShare}>
            <Icon name="share-variant" size={18} color={colors.accent} />
            <Text style={[styles.buttonText, {color: colors.accent}]}>
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  image: {width: '100%', height: 240},
  inner: {
    padding: 18,
    marginTop: -20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  title: {fontSize: 20, fontWeight: '900', marginBottom: 8},
  meta: {fontSize: 12, marginBottom: 12},
  content: {fontSize: 15, lineHeight: 22, marginBottom: 18},
  row: {flexDirection: 'row', justifyContent: 'space-between'},
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  buttonText: {marginLeft: 8, fontWeight: '700'},
});

export default ArticleDetailScreen;
