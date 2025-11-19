// src/screens/HomeScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Platform,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { useTheme } from '../context/ThemeContext';
import NewsCard from '../components/NewsCard';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Image } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEFAULT_LAT = 28.6139;
const DEFAULT_LON = 77.209;

// KEYS
// NOTE: If you're getting empty articles, your News API key might be on the free tier
// which has limitations. Try these solutions:
// 1. Use 'everything' endpoint: https://newsapi.org/v2/everything?q=india&apiKey=...
// 2. Try without 'category' parameter
// 3. Check your API key at https://newsapi.org/account
// 4. Free tier limit: 100 requests/day, 1 month old articles max
const NEWS_API_KEY = '995e4a922f2a496f9bbf2ffe227a4e33';
const WEATHER_KEY = 'cf02502718e0482abc0131032250602';

const STORAGE = {
  NEWS: 'cached_news_v2',
  FAVS: 'news_favorites_v1',
};

const WEATHER_BACKGROUNDS = {
  sunny: require('../assets/sunny_bg.jpg'),
  rainy: require('../assets/rainy_bg.jpg'),
  cloudy: require('../assets/cloudy_bg.jpg'),
};

const WEATHER_GRADIENTS = {
  sunny: ['rgba(251, 191, 36, 0.35)', 'rgba(245, 158, 11, 0.15)', 'transparent'],
  rainy: ['rgba(71, 85, 105, 0.45)', 'rgba(51, 65, 85, 0.25)', 'transparent'],
  cloudy: ['rgba(100, 116, 139, 0.35)', 'rgba(71, 85, 105, 0.18)', 'transparent'],
};

const getWeatherCondition = (d) => {
  const desc = (d || '').toLowerCase();
  if (desc.includes('rain') || desc.includes('shower')) return 'rainy';
  if (desc.includes('cloud') || desc.includes('mist') || desc.includes('fog')) return 'cloudy';
  return 'sunny';
};

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const HomeScreen = ({ navigation }) => {
  const { colors, units, toggleUnits, theme } = useTheme();

  const [news, setNews] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);
  const [weatherCondition, setWeatherCondition] = useState('sunny');
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const parallaxTranslate = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  });

  const weatherHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [SCREEN_HEIGHT * 0.48, 0],
    extrapolate: 'clamp',
  });

  const weatherOpacity = scrollY.interpolate({
    inputRange: [0, 150, 200],
    outputRange: [1, 0.4, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    (async () => {
      const fav = await AsyncStorage.getItem(STORAGE.FAVS);
      if (fav) setFavorites(JSON.parse(fav));

      const cachedNews = await AsyncStorage.getItem(STORAGE.NEWS);
      if (cachedNews) {
        const parsed = JSON.parse(cachedNews);
        if (parsed.length > 0) setNews(parsed);
      }
    })();

    fetchNews();
    Geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      (error) => {
        console.log('Geolocation error:', error);
        fetchWeather(DEFAULT_LAT, DEFAULT_LON);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 },
    );
  }, []);

  const saveFavorites = async (list) =>
    await AsyncStorage.setItem(STORAGE.FAVS, JSON.stringify(list));

  const onToggleFavorite = (article) => {
    const key = article.url || article.title;
    const next = { ...favorites };
    next[key] ? delete next[key] : (next[key] = article);
    setFavorites(next);
    saveFavorites(next);
  };

  const fetchNews = async (q = '') => {
    setLoading(true);
    setError(null);
    try {
      // Try to load cached news first
      const cached = await AsyncStorage.getItem(STORAGE.NEWS);
      if (cached) setNews(JSON.parse(cached));

      // Build the API URL
      const url = q
  ? `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`
  : `https://newsapi.org/v2/everything?q=india&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`;

      
      const res = await axios.get(url);
      
      console.log("API RESPONSE >>>", res.data);

      if (res.data.articles && res.data.articles.length > 0) {
        setNews(res.data.articles);
        await AsyncStorage.setItem(STORAGE.NEWS, JSON.stringify(res.data.articles));
        setError(null);
      } else {
        setError('No news articles found. Try different search terms or pull to refresh.');
      }
    } catch (e) {
      console.error('News fetch error:', e.message);
      setError('Failed to fetch news. Showing cached articles.');
    }
    setLoading(false);
    setRefreshing(false);
  };

  const fetchWeather = async (lat, lon) => {
    setWeatherLoading(true);
    try {
      const res = await axios.get('https://api.weatherapi.com/v1/current.json', {
        params: { key: WEATHER_KEY, q: `${lat},${lon}`, aqi: 'no' },
      });

      const cur = res.data.current;
      const cond = getWeatherCondition(cur.condition.text);

      // Manual formula conversion
      const tempC = cur.temp_c;
      const tempF = (tempC * 9) / 5 + 32;

      const feelsC = cur.feelslike_c;
      const feelsF = (feelsC * 9) / 5 + 32;

      setWeather({
        temp: units === 'c' ? Math.round(tempC) : Math.round(tempF),
        feelsLike: units === 'c' ? Math.round(feelsC) : Math.round(feelsF),
        humidity: cur.humidity,
        desc: cur.condition.text,
        wind: Math.round(cur.wind_kph),
        icon: cur.condition.icon,
      });

      setWeatherCondition(cond);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    } catch (e) {
      console.error('Weather fetch error:', e);
      setError('Weather fetch failed.');
    }
    setWeatherLoading(false);
  };

  const filteredArticles = query
    ? news.filter((n) =>
        ((n.title || '') + (n.description || ''))
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    : news;

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews(query);
    Geolocation.getCurrentPosition(
      (p) => fetchWeather(p.coords.latitude, p.coords.longitude),
      () => fetchWeather(DEFAULT_LAT, DEFAULT_LON),
    );
  };

  const openArticle = async (article) => {
    navigation.navigate('ArticleDetail', { article });
  };

  const renderItem = ({ item }) => (
    <NewsCard
      article={item}
      onOpen={openArticle}
      onToggleFavorite={onToggleFavorite}
      isFavorite={!!favorites[item.url || item.title]}
    />
  );

  const WeatherHeader = () => (
    <Animated.View style={[styles.headerWrap, { height: weatherHeight }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { transform: [{ translateY: parallaxTranslate }] },
        ]}
      >
        <ImageBackground
          source={WEATHER_BACKGROUNDS[weatherCondition]}
          style={styles.bg}
          resizeMode="cover"
        >
          <LinearGradient
            colors={WEATHER_GRADIENTS[weatherCondition]}
            style={styles.gradient}
          />
        </ImageBackground>
      </Animated.View>

      <Animated.View
        style={[styles.headerContent, { opacity: weatherOpacity }]}
      >
        {weatherLoading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Animated.View style={{ alignItems: 'center', opacity: fadeAnim }}>
            <View style={styles.tempRow}>
              {weather?.icon && (
                <Image
                  source={{ uri: `https:${weather.icon}` }}
                  style={styles.icon}
                />
              )}
              <Text style={styles.tempText}>
                {weather?.temp}°{units.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.descText}>{weather?.desc}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Feels Like</Text>
                <Text style={styles.statValue}>{weather?.feelsLike}°</Text>
              </View>

              <View style={[styles.statItem, styles.statDivider]}>
                <Text style={styles.statLabel}>Humidity</Text>
                <Text style={styles.statValue}>{weather?.humidity}%</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Wind</Text>
                <Text style={styles.statValue}>{weather?.wind} km/h</Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={toggleUnits} style={styles.smallBtn}>
                <Icon name="swap-vertical" size={18} color="#fff" />
                <Text style={styles.smallBtnText}>
                  {units === 'c' ? '°C' : '°F'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Profile')}
                style={styles.smallBtn}
              >
                <Icon name="account-circle" size={18} color="#fff" />
                <Text style={styles.smallBtnText}>Profile</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* List with integrated header */}
      <AnimatedFlatList
        data={filteredArticles}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.url || item.title || `item-${index}`}
        ListHeaderComponent={
          <>
            <WeatherHeader />
            
            {/* Search box - now inside the list */}
            <View style={styles.searchWrap}>
              <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
                <Icon name="magnify" size={22} color={colors.text} />

                <TextInput
                  placeholder="Search news..."
                  placeholderTextColor={colors.muted}
                  style={[styles.searchInput, { color: colors.text }]}
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={() => fetchNews(query)}
                  returnKeyType="search"
                />

                {query.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setQuery('');
                      fetchNews();
                    }}
                  >
                    <Icon name="close-circle" size={22} color={colors.muted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <>
                <Icon name="newspaper-variant-outline" size={64} color={colors.muted} />
                <Text style={[styles.emptyText, { color: colors.muted }]}>
                  {error || 'No articles found'}
                </Text>
              </>
            )}
          </View>
        )}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  
  searchWrap: { 
    paddingHorizontal: 16, 
    paddingTop: 20,
    paddingBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchInput: { 
    flex: 1, 
    padding: 0, 
    fontSize: 16,
    fontWeight: '500',
  },

  headerWrap: {
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  bg: { 
    width: '100%', 
    height: '100%',
  },
  gradient: { 
    ...StyleSheet.absoluteFillObject,
  },

  headerContent: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  tempRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16,
  },
  icon: { 
    width: 100, 
    height: 100,
  },
  tempText: { 
    fontSize: 72, 
    fontWeight: '900', 
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  descText: { 
    color: '#fff', 
    fontSize: 18,
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'capitalize',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    gap: 0,
    backdropFilter: 'blur(10px)',
  },
  statItem: { 
    alignItems: 'center', 
    flex: 1,
  },
  statDivider: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statLabel: { 
    fontSize: 12, 
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#fff',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
  },
  smallBtnText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '700',
    fontSize: 14,
  },

  empty: { 
    padding: 40, 
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HomeScreen;