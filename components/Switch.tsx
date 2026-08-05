import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useThemeContext } from '@/contexts/ThemedContext';

const TRACK_WIDTH = 42;
const TRACK_HEIGHT = 25;
const THUMB_SIZE = 21;
const PADDING = 2;
const DURATION = 200;

interface Props {
  value?: boolean;
  onChange?: (value: boolean) => void;
}

const CustomSwitch = ({ value = false, onChange }: Props) => {
  const { colors } = useThemeContext();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: DURATION });
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.borderColor, colors.primary],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 1],
          [0, TRACK_WIDTH - THUMB_SIZE - PADDING * 2],
        ),
      },
    ],
  }));

  return (
    <Pressable onPress={() => onChange?.(!value)} hitSlop={8}>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: PADDING,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default CustomSwitch;
