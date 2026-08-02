import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useThemeContext } from '@/contexts/ThemedContext';

interface Props {
  label: string;
  icon?: string;
  iconBgColor?: string;
  onPress: () => void;
  onDismiss: () => void;
}

export default function CategorySuggestionChip({
  label,
  icon,
  iconBgColor,
  onPress,
  onDismiss,
}: Props) {
  const { colors } = useThemeContext();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 50,
        paddingVertical: 6,
        paddingLeft: 10,
        paddingRight: 8,
      }}>
      <Pressable
        onPress={onPress}
        style={{ flexDirection: 'row', alignItems: 'center', columnGap: 6 }}>
        <MaterialIcons name="auto-awesome" size={14} color={colors.primary} />
        <Text style={{ color: colors.secondary, fontFamily: 'Inter-500' }}>AI pick:</Text>
        {icon ? (
          <View
            style={{
              backgroundColor: iconBgColor,
              padding: 4,
              borderRadius: 50,
            }}>
            <MaterialIcons
              name={icon as React.ComponentProps<typeof MaterialIcons>['name']}
              size={12}
              color={colors.onPrimary}
            />
          </View>
        ) : null}
        <Text style={{ color: colors.secondary, fontFamily: 'Inter-500' }}>{label}</Text>
      </Pressable>
      <Pressable onPress={onDismiss} style={{ paddingHorizontal: 6 }} hitSlop={8}>
        <MaterialIcons name="close" size={16} color={colors.text} />
      </Pressable>
    </View>
  );
}
