import React from 'react';
import { StyleSheet, type ViewProps } from 'react-native';
import { SafeAreaView, SafeAreaProvider, SafeAreaViewProps } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/useThemeColor';

type SafeAreaViewComponentProps = ViewProps & SafeAreaViewProps & {
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
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[{ backgroundColor: '#0F0E17' }, styles.container, style]}
        {...otherProps}>
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
