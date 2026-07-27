import React from 'react';
import { ActivityIndicator, StyleSheet, View, Dimensions } from 'react-native';
import { useThemeContext } from '@/contexts/ThemedContext';

const { width, height } = Dimensions.get('window');

const OverlayLoader = () => {
  const { colors } = useThemeContext();
  return (
    <View style={[styles.overlay, { backgroundColor: colors.scrim }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height,
    width,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
});

export default OverlayLoader;
