import React from 'react';
import { Alert, Pressable, Text } from 'react-native';

import { useThemeContext } from '@/contexts/ThemedContext';

interface Props {
  name: string;
  onPress: () => void;
  onDelete: () => void;
}

export default function TemplateChip({ name, onPress, onDelete }: Props) {
  const { colors } = useThemeContext();

  const handleLongPress = () => {
    Alert.alert('Delete template?', `Remove "${name}" from your quick-add templates?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

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
      onLongPress={handleLongPress}>
      <Text style={{ color: colors.secondary, fontFamily: 'Inter-500' }}>{name}</Text>
    </Pressable>
  );
}
