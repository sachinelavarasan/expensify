import React from 'react';
import { useThemeContext } from '../contexts/ThemedContext';
import { Feather } from '@expo/vector-icons';
import CustomSwitch from './Switch';
import SettingsRow from './SettingsRow';

const TINT = '#6366F1';

interface Props {
  noCard?: boolean;
  topDivider?: boolean;
}

const ThemeToggle = ({ noCard, topDivider }: Props) => {
  const { theme, toggleTheme } = useThemeContext();
  const isDark = theme === 'dark';

  return (
    <SettingsRow
      icon={
        isDark ? (
          <Feather name="moon" size={18} color={TINT} />
        ) : (
          <Feather name="sun" size={18} color={TINT} />
        )
      }
      iconBg={`${TINT}1A`}
      title={isDark ? 'Dark Mode' : 'Light Mode'}
      subtitle="Choose your preferred theme"
      right={<CustomSwitch value={isDark} onChange={toggleTheme} />}
      noCard={noCard}
      topDivider={topDivider}
    />
  );
};

export default ThemeToggle;
