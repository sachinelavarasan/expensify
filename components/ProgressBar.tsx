import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useThemeContext } from '@/contexts/ThemedContext';

interface Props {
  percentage: number;
  height?: number;
  fillColor?: string;
  trackColor?: string;
  label?: string;
  style?: ViewStyle;
  duration?: number;
}

export default function ProgressBar({
  percentage,
  height = 8,
  fillColor,
  trackColor,
  label,
  style,
  duration = 800,
}: Props) {
  const { colors } = useThemeContext();
  const clamped = Math.min(Math.max(percentage, 0), 100);

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(clamped, { duration });
  }, [clamped, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: trackColor || colors.borderColor },
        style,
      ]}>
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: fillColor || colors.primary },
          animatedStyle,
        ]}
      />
      {!!label && (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { color: colors.onPrimary, lineHeight: height }]}>
              {label}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  labelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 10,
    fontFamily: 'Inter-600',
  },
});
