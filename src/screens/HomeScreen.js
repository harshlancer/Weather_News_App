// src/screens/HomeScreen.js
import React, {useState, useEffect} from 'react';
import { Image } from 'react-native';
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
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import {useTheme} from '../context/ThemeContext';
import NewsCard from '../components/NewsCard';
import LinearGradient from 'react-native-linear-gradient';
import { ImageBackground } from 'react-native';

const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');
const DEFAULT_LAT = 28.6139;
const DEFAULT_LON = 77.209;
const API_KEY = '995e4a922f2a496f9bbf2ffe227a4e33';
const WEATHER_KEY = 'cf02502718e0482abc0131032250602';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// 🎨 Dynamic background mapping
const WEATHER_BACKGROUNDS = {
  sunny: require('../assets/sunny_bg.jpg'),
  rainy: require('../assets/rainy_bg.jpg'),
  cloudy: require('../assets/cloudy_bg.jpg'),
};

// 🌤️ Weather gradient colors based on condition
const WEATHER_GRADIENTS = {
  sunny: ['rgba(251, 191, 36, 0.4)', 'rgba(245, 158, 11, 0.2)', 'transparent'],
  rainy: ['rgba(71, 85, 105, 0.5)', 'rgba(51, 65, 85, 0.3)', 'transparent'],
  cloudy: ['rgba(100, 116, 139, 0.4)', 'rgba(71, 85, 105, 0.2)', 'transparent'],
};

const HomeScreen = ({navigation}) => {
  const {colors, theme, toggleTheme} = useTheme();
  const [news, setNews] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherCondition, setWeatherCondition] = useState('sunny');

  const scrollY = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // 🎭 Animated interpolations
  const parallaxTranslate = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  });

  const weatherHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [SCREEN_HEIGHT * 0.5, 0],
    extrapolate: 'clamp',
  });

  const weatherOpacity = scrollY.interpolate({
    inputRange: [0, 150, 200],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });

  const weatherTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const tempScale = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.6],
    extrapolate: 'clamp',
  });

  // 🎨 Determine weather condition from description
  const getWeatherCondition = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) {
      return 'rainy';
    } else if (desc.includes('cloud') || desc.includes('overcast') || desc.includes('mist') || desc.includes('fog')) {
      return 'cloudy';
    }
    return 'sunny'; // Clear, Sunny, Partly cloudy, etc.
  };

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const cached = await AsyncStorage.getItem('news');
      if (cached) setNews(JSON.parse(cached));

      const res = await axios.get(
        `https://newsapi.org/v2/top-headlines?country=in&apiKey=${API_KEY}`,
      );
      if (res.data.articles && res.data.articles.length > 0) {
        setNews(res.data.articles);
        await AsyncStorage.setItem('news', JSON.stringify(res.data.articles));
      } else {
        setError('No news articles found');
      }
    } catch (e) {
      console.log('News error:', e);
      setError('Failed to fetch news');
    }
    setLoading(false);
  };

  const fetchWeather = async (lat = DEFAULT_LAT, lon = DEFAULT_LON) => {
    setWeatherLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `https://api.weatherapi.com/v1/current.json?key=${WEATHER_KEY}&q=${lat},${lon}&aqi=no`,
      );

      const current = res.data.current;
      const condition = getWeatherCondition(current.condition.text);
      
      setWeather({
        temp: Math.round(current.temp_c),
        desc: current.condition.text,
        icon: current.condition.icon,
        feelsLike: Math.round(current.feelslike_c),
        humidity: current.humidity,
        windKph: Math.round(current.wind_kph),
      });
      
      setWeatherCondition(condition);
      
      // ✨ Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
      
    } catch (e) {
      console.log('Weather API error:', e.response?.data || e.message);
      setError('Failed to fetch weather');
    }

    setWeatherLoading(false);
  };

  useEffect(() => {
    fetchNews();
    Geolocation.getCurrentPosition(
      position =>
        fetchWeather(position.coords.latitude, position.coords.longitude),
      () => fetchWeather(),
      {enableHighAccuracy: true, timeout: 30000, maximumAge: 10000},
    );
  }, []);

  const onRefresh = () => {
    fetchNews();
    Geolocation.getCurrentPosition(
      position =>
        fetchWeather(position.coords.latitude, position.coords.longitude),
      () => fetchWeather(),
    );
  };

  // 🌈 Beautiful Weather Header with Dynamic Background
  const WeatherHeader = () => (
    <Animated.View
      style={{
        height: weatherHeight,
        overflow: 'hidden',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
      }}
    >
      {/* 🖼️ DYNAMIC PARALLAX BACKGROUND */}
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          transform: [{translateY: parallaxTranslate}],
        }}
      >
        <ImageBackground
          source={WEATHER_BACKGROUNDS[weatherCondition]}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* 🎨 Dynamic Gradient Overlay */}
          <LinearGradient
            colors={WEATHER_GRADIENTS[weatherCondition]}
            style={styles.gradientOverlay}
          />
          
          {/* 🌟 Subtle bottom gradient for better text visibility */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.2)']}
            style={styles.bottomGradient}
          />
        </ImageBackground>
      </Animated.View>

      {/* ☁️ WEATHER CONTENT */}
      <Animated.View
        style={[
          styles.weatherContent,
          {
            opacity: weatherOpacity,
            transform: [{translateY: weatherTranslateY}],
          },
        ]}
      >
        {weatherLoading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Animated.View style={[styles.weatherInfo, {opacity: fadeAnim}]}>
            {/* 🌤️ Weather Icon with glow effect */}
            {weather?.icon && (
              <Animated.View
                style={[
                  styles.iconContainer,
                  {transform: [{scale: tempScale}]},
                ]}
              >
                <View style={styles.iconGlow} />
                <Image
                  source={{uri: 'https:' + weather.icon}}
                  style={styles.weatherIcon}
                />
              </Animated.View>
            )}

            {/* 🌡️ Temperature Display */}
            <Animated.Text
              style={[
                styles.temperature,
                {transform: [{scale: tempScale}]},
              ]}
            >
              {weather?.temp}°
            </Animated.Text>

            {/* 📝 Weather Description */}
            <Text style={styles.description}>{weather?.desc}</Text>

            {/* 📊 Weather Details Row */}
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Feels like</Text>
                <Text style={styles.detailValue}>{weather?.feelsLike}°C</Text>
              </View>
              
              <View style={styles.detailDivider} />
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Humidity</Text>
                <Text style={styles.detailValue}>{weather?.humidity}%</Text>
              </View>
              
              <View style={styles.detailDivider} />
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Wind</Text>
                <Text style={styles.detailValue}>{weather?.windKph} km/h</Text>
              </View>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle="light-content" 
      />
      
      <AnimatedFlatList
        data={news}
        renderItem={({item}) => <NewsCard article={item} />}
        keyExtractor={item => item.url || Math.random().toString()}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={['#3b82f6']}
          />
        }
        ListHeaderComponent={<WeatherHeader />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <Text style={styles.emptyText}>
                Pull to refresh for news.
              </Text>
            )}
          </View>
        }
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  weatherContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight || 20,
  },
  weatherInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    top: -5,
    left: -5,
    zIndex: -1,
  },
  weatherIcon: {
    width: 110,
    height: 110,
  },
  temperature: {
    color: '#fff',
    fontSize: 72,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
    letterSpacing: -2,
  },
  description: {
    color: '#fff',
    fontSize: 22,
    marginTop: 8,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  detailItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  detailDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default HomeScreen;