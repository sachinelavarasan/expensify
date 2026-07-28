import React from 'react';
import { Pressable, Text } from 'react-native';
import { Entypo } from '@expo/vector-icons';

import { useThemeContext } from '@/contexts/ThemedContext';

interface Props {
  label: string;
  value?: string;
  onRemove: () => void;
}

export default function FilterChip({ label, value, onRemove }: Props) {
  const { colors } = useThemeContext();

  return (
    <Pressable
      style={{
        borderWidth: 1,
        borderColor: colors.primary,
        paddingVertical: 2,
        paddingHorizontal: 10,
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
      }}
      onPress={onRemove}>
      <Text style={{ color: colors.secondary, fontFamily: 'Inter-500' }}>
        {value ? (
          <>
            {label}:{' '}
            <Text style={{ color: colors.title, textTransform: 'capitalize' }}>{value}</Text>
          </>
        ) : (
          label
        )}
      </Text>
      <Entypo name="cross" size={20} color={colors.secondary} />
    </Pressable>
  );
}
