import React from 'react';
import { View, Text } from 'react-native';
import { useThemeContext } from '../contexts/ThemedContext';
import { Feather } from '@expo/vector-icons';
import CustomSwitch from './Switch';

const ThemeToggle = () => {
  const { theme, toggleTheme, colors } = useThemeContext();
  const isDark = theme === 'dark';

  return (
    <View style={{ flex: 1, gap: 5 }}>
      {/* Section Header */}
      <Text style={{ fontFamily: 'Inter-500', color: colors.title }}>Appearance</Text>

      {/* Toggle Row */}
      <View style={{ flex: 1, flexDirection: 'column', gap: 2, padding: 8 }}>
        {/* Left side: Icon + Label */}
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            {isDark ? (
              <Feather name="moon" size={20} color={colors.title} style={{ marginRight: 8 }} />
            ) : (
              <Feather name="sun" size={20} color="#ffaa00" style={{ marginRight: 8 }} />
            )}
            <Text className="text-lg" style={{ color: colors.title, fontFamily: 'Inter-500' }}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </View>

          {/* Right side: Switch */}
          <CustomSwitch value={isDark} onChange={toggleTheme} />
        </View>
        <Text
          style={{
            color: colors.description,
            fontFamily: 'Inter-500',
            fontSize: 12,
            paddingHorizontal: 2,
          }}>
          Choose your preferred theme
        </Text>
      </View>
    </View>
  );
};

export default ThemeToggle;
