import React from 'react';
import { StyleSheet, type ViewProps } from 'react-native';
import { SafeAreaView, SafeAreaProvider, SafeAreaViewProps } from 'react-native-safe-area-context';
import { useThemeContext } from '@/contexts/ThemedContext';
import { StatusBar as ExpoStatus } from 'expo-status-bar';

type SafeAreaViewComponentProps = ViewProps &
  SafeAreaViewProps & {
    children: React.ReactElement;
    lightColor?: string;
    darkColor?: string;
  };

const SafeAreaViewComponent = ({
  children,
  style,
  lightColor,
  darkColor,
  ...otherProps
}: SafeAreaViewComponentProps) => {
  const { colors, theme } = useThemeContext();
  const edgeColor = theme === 'light' ? colors.background : colors.themedViewBg[0];
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.container, style, { backgroundColor: edgeColor }]}
        {...otherProps}>
        <ExpoStatus style={theme === 'dark' ? 'light' : 'dark'} />
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};
export default SafeAreaViewComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
