import React from 'react';
import { StyleSheet, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/useThemeColor';

type SafeAreaViewComponentProps = ViewProps & {
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
    <SafeAreaView style={[{ backgroundColor: '#0E0E10' }, styles.container, style]} {...otherProps}>
      {children}
    </SafeAreaView>
  );
};
export default SafeAreaViewComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
