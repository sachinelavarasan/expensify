import React, { useEffect } from 'react';
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

const ACTION_WIDTH = 70;

type Props = {
  children: React.ReactNode;
  onDelete?: () => void;
  onStar?: () => void;
  isStarred?: boolean;
  disabled?: boolean;
};

export default function SwipeableRow({
  children,
  onDelete,
  onStar,
  isStarred = false,
  disabled = false,
}: Props) {
  const { colors } = useThemeContext();
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  const revealWidth = onStar ? ACTION_WIDTH * 2 : ACTION_WIDTH;
  const swipeThreshold = revealWidth / 2;

  useEffect(() => {
    if (disabled) {
      translateX.value = withSpring(0);
    }
  }, [disabled]);

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      // eslint-disable-next-line react-hooks/immutability -- Reanimated shared value, safe to mutate outside render
      translateX.value = Math.min(0, startX.value + event.translationX);
    })
    .onEnd(() => {
      if (translateX.value < -swipeThreshold) {
        // eslint-disable-next-line react-hooks/immutability -- Reanimated shared value, safe to mutate outside render
        translateX.value = withSpring(-revealWidth);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const actionsStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-revealWidth, -revealWidth + 20],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  const handleDelete = () => {
    if (onDelete) onDelete();
    // eslint-disable-next-line react-hooks/immutability -- Reanimated shared value, safe to mutate outside render
    translateX.value = withSpring(0);
  };

  const handleStar = () => {
    if (onStar) onStar();
    // eslint-disable-next-line react-hooks/immutability -- Reanimated shared value, safe to mutate outside render
    translateX.value = withSpring(0);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.actionsContainer, actionsStyle]}>
        {!!onStar && (
          <TouchableOpacity style={styles.actionButton} onPress={handleStar}>
            <MaterialIcons
              name={isStarred ? 'star' : 'star-outline'}
              size={24}
              color={colors.favorite}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
          <MaterialIcons name="delete-outline" size={24} color={colors.expense} />
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
    marginBottom: 8,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  actionsContainer: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    width: ACTION_WIDTH,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
});
