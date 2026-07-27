import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useThemeContext } from '@/contexts/ThemedContext';

const BUTTON_WIDTH = 100;
const SWIPE_THRESHOLD = BUTTON_WIDTH / 2;

type Props = {
  children: React.ReactNode;
  onDelete?: () => void;
};

export default function SwipeableRow({ children, onDelete }: Props) {
  const { colors } = useThemeContext();
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = Math.min(0, startX.value + event.translationX);
    })
    .onEnd(() => {
      if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-BUTTON_WIDTH);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-BUTTON_WIDTH, -BUTTON_WIDTH + 20],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  const handleDelete = () => {
    if (onDelete) onDelete();
    translateX.value = withSpring(0);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.deleteContainer, deleteStyle]}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <MaterialIcons name="delete" size={30} color={colors.expense} />
        </TouchableOpacity>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[rowStyle]}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 10,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  deleteContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  deleteButton: {
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRadius: 4,
  },
  actionText: {
    color: 'white',
    fontFamily: 'Inter-700',
    fontSize: 16,
  },
});
