import { ColorValue, View, type ViewProps } from 'react-native';

import { useThemeContext } from '@/contexts/ThemedContext';
import { LinearGradient } from 'expo-linear-gradient';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, children, ...otherProps }: ThemedViewProps) {
  const { colors } = useThemeContext();
  return (
    <LinearGradient
      colors={
        colors.themedViewBg as [ColorValue, ColorValue]
      }
      start={{ x: 2, y: 0 }}
      end={{ x: 0, y: 2 }}
      style={[{ flex: 1 }, style]}
      {...otherProps}>
      {children}
    </LinearGradient>
  );
}
