// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEYS = {
  THEME: 'app_theme',
  UNITS: 'weather_units',
};

const colorPalettes = {
  light: {
    background: '#f5f7fb',
    card: '#ffffff',
    text: '#0b1220',
    muted: '#6b7280',
    primary: '#4f46e5', // futuristic indigo
    accent: '#06b6d4',
    statusBar: 'dark-content',
  },
  dark: {
    background: '#06070a',
    card: '#0f1724',
    text: '#e6eef8',
    muted: '#9aa4b2',
    primary: '#7c3aed',
    accent: '#06b6d4',
    statusBar: 'light-content',
  },
};

export const ThemeProvider = ({ children }) => {
  const system = Appearance.getColorScheme() || 'light';
  const [theme, setTheme] = useState(system);
  const [units, setUnits] = useState('c'); // 'c' or 'f'
  const colors = colorPalettes[theme] || colorPalettes.light;

  useEffect(() => {
    // load persisted theme & units
    (async () => {
      try {
        const t = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        const u = await AsyncStorage.getItem(STORAGE_KEYS.UNITS);
        if (t) setTheme(t);
        if (u) setUnits(u);
      } catch (e) {
        console.warn('Theme load error', e);
      }
    })();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Respect user's explicit preference (persisted) — only auto change if no saved theme
      (async () => {
        try {
          const saved = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
          if (!saved && colorScheme) setTheme(colorScheme);
        } catch (_) {}
      })();
    });

    return () => {
      // remove listener
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      } else if (subscription) {
        // older RN shape
        Appearance.removeChangeListener?.();
      }
    };
  }, []);

  const toggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, next);
    } catch (_) {}
  };

  const toggleUnits = async () => {
    const next = units === 'c' ? 'f' : 'c';
    setUnits(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.UNITS, next);
    } catch (_) {}
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors,
        toggleTheme,
        units,
        toggleUnits,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
