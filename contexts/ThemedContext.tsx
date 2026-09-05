import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import { LightColors, DarkColors, ThemeColors } from '../utils/Colors';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colorScheme: ColorSchemeName;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEME_STORAGE_KEY = 'APP_THEME';
const STORAGE_KEY = THEME_STORAGE_KEY;

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [themeColors, setThemeColors] = useState<ThemeColors>(LightColors);

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTheme === 'dark') {
        setTheme('dark');
        setThemeColors(DarkColors);
      } else {
        setTheme('light');
        setThemeColors(LightColors);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(themeColors.bottomBarBackground);
  }, [themeColors]);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newTheme);
      setTheme(newTheme);
      setThemeColors(newTheme === 'light' ? LightColors : DarkColors);
    } catch (error) {
      console.error('Error saving theme to AsyncStorage:', error);
    }
  };

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      colorScheme: theme,
      colors: themeColors,
    }),
    [theme, themeColors],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used inside ThemeProvider');
  return ctx;
};
