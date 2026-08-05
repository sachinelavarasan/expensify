import { View, type ViewProps } from 'react-native';

import { useThemeContext } from '@/contexts/ThemedContext';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, children, ...otherProps }: ThemedViewProps) {
  const { colors } = useThemeContext();

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }, style]} {...otherProps}>
      {children}
    </View>
  );
}
