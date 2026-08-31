import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemedContext';

interface Props {
  checked: boolean;
  onPress: () => void;
}

const Checkbox = ({ checked, onPress }: Props) => {
  const { colors } = useThemeContext();
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <View
        style={[
          styles.box,
          {
            backgroundColor: checked ? colors.primary : colors.cardBg,
            borderColor: checked ? colors.primary : colors.borderColor,
          },
        ]}>
        {checked && <Feather name="check" size={12} color={colors.onPrimary} />}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Checkbox;
