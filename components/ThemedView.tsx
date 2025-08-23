import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, children, ...otherProps }: ThemedViewProps) {
  return (
    <LinearGradient
      colors={['#26004d', '#1a0033', '#0d001a', '#000000']}
      start={{ x: 2, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[{ flex: 1 }, style]}
      {...otherProps}>
      {children}
    </LinearGradient>
  );
}
