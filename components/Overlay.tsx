import React from 'react';
import { ActivityIndicator, StyleSheet, View, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const OverlayLoader = () => {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#6900FF" />
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
    backgroundColor: 'rgba(14, 14, 16, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
});

export default OverlayLoader;
