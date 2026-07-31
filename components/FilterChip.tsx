import React from 'react';
import { Pressable, Text } from 'react-native';
import { Entypo } from '@expo/vector-icons';

import { useThemeContext } from '@/contexts/ThemedContext';

interface Props {
  label: string;
  value?: string;
  onRemove: () => void;
  variant?: 'outline' | 'solid';
}

export default function FilterChip({ label, value, onRemove, variant = 'outline' }: Props) {
  const { colors } = useThemeContext();
  const isSolid = variant === 'solid';

  return (
    <Pressable
      style={{
        borderWidth: isSolid ? 0 : 1,
        borderColor: colors.primary,
        backgroundColor: isSolid ? `${colors.primary}22` : 'transparent',
        paddingVertical: isSolid ? 4 : 2,
        paddingHorizontal: isSolid ? 10 : 10,
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      }}
      onPress={onRemove}>
      <Text
        style={{
          color: isSolid ? colors.primary : colors.secondary,
          fontFamily: 'Inter-500',
          fontSize: isSolid ? 12 : 14,
        }}>
        {value ? (
          <>
            {label}:{' '}
            <Text
              style={{
                color: isSolid ? colors.primary : colors.title,
                textTransform: 'capitalize',
                fontFamily: 'Inter-700',
              }}>
              {value}
            </Text>
          </>
        ) : (
          label
        )}
      </Text>
      <Entypo name="cross" size={isSolid ? 13 : 16} color={isSolid ? colors.primary : colors.secondary} />
    </Pressable>
  );
}
