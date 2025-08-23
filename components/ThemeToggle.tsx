import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useThemeContext } from '../contexts/ThemedContext';

const ThemeToggle = () => {
  const { theme, setTheme, colorScheme } = useThemeContext();

  const options: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>
        Current: {theme} (active: {colorScheme})
      </Text>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => setTheme(opt)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: theme === opt ? '#6B5DE6' : '#ccc',
            }}>
            <Text style={{ color: theme === opt ? '#fff' : '#000' }}>{opt.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default ThemeToggle;
