import React from 'react';
import { useThemeContext } from '../contexts/ThemedContext';
import { Feather } from '@expo/vector-icons';
import CustomSwitch from './Switch';
import SettingsRow from './SettingsRow';

const ThemeToggle = () => {
  const { theme, toggleTheme, colors } = useThemeContext();
  const isDark = theme === 'dark';

  return (
    <SettingsRow
      icon={
        isDark ? (
          <Feather name="moon" size={18} color={colors.onPrimary} />
        ) : (
          <Feather name="sun" size={18} color={colors.onPrimary} />
        )
      }
      title={isDark ? 'Dark Mode' : 'Light Mode'}
      subtitle="Choose your preferred theme"
      right={<CustomSwitch value={isDark} onChange={toggleTheme} />}
    />
  );
};

export default ThemeToggle;
