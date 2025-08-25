import React from 'react';
import { StyleSheet, type ViewProps } from 'react-native';
import { SafeAreaView, SafeAreaProvider, SafeAreaViewProps } from 'react-native-safe-area-context';
import { useThemeContext } from '@/contexts/ThemedContext';


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
  const { colors } = useThemeContext();
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[{ backgroundColor: colors.bottomBarBackground }, styles.container, style]}
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
