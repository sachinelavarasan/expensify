import React from 'react';
import { Pressable, Text } from 'react-native';

import { useThemeContext } from '@/contexts/ThemedContext';

interface Props {
  name: string;
  onPress: () => void;
  // Caller's responsibility to confirm before calling this (see transaction.tsx,
  // which wraps its own deleteTemplate call with useConfirm) - kept out of this
  // component so a chip rendered N times in a list doesn't mount N confirm modals.
  onDelete: () => void;
}

export default function TemplateChip({ name, onPress, onDelete }: Props) {
  const { colors } = useThemeContext();

  return (
    <Pressable
      style={{
        borderWidth: 1,
        borderColor: colors.primary,
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 50,
      }}
      onPress={onPress}
      onLongPress={onDelete}>
      <Text style={{ color: colors.secondary, fontFamily: 'Inter-500' }}>{name}</Text>
    </Pressable>
  );
}
