import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ICategory } from '@/types';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';
import { Spacing } from '@/utils/Spacing';
import { getCategoryIconName } from '@/utils/categoryIcon';

interface Props {
  categories: ICategory[] | [];
  selected: number | string | string[] | undefined;
  onSelect: (id: string) => void;
  multiple?: boolean;
}

const AVATAR_SIZE = 48;

export default function CategorySelector({
  categories,
  selected,
  onSelect,
  multiple = false,
}: Props) {
  const { colors } = useThemeContext();

  const isSelected = (id: string) =>
    multiple ? ((selected as string[] | undefined)?.includes(id) ?? false) : selected === id;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}>
      {categories.map((item) => {
        const active = isSelected(item.exp_tc_id);
        const itemColor = item.exp_tc_icon_bg_color || colors.categoryFallbackIcon;
        return (
          <Pressable
            key={item.exp_tc_id}
            onPress={() => onSelect(item.exp_tc_id)}
            hitSlop={{ top: 4, bottom: 4 }}
            style={styles.chip}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: `${itemColor}2E` },
                active && { borderWidth: 2, borderColor: colors.primary },
              ]}>
              <MaterialIcons
                name={getCategoryIconName(item.exp_tc_icon)}
                size={22}
                color={itemColor}
              />
              {active && (
                <View
                  style={[
                    styles.checkBadge,
                    { backgroundColor: colors.primary, shadowColor: colors.shadow },
                  ]}>
                  <MaterialIcons name="check" size={11} color={colors.onPrimary} />
                </View>
              )}
            </View>
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                { color: active ? colors.title : colors.description },
                active && styles.labelActive,
              ]}>
              {item.exp_tc_label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: 2,
  },
  chip: {
    alignItems: 'center',
    width: 64,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  label: {
    fontSize: FontSize.xs,
    fontFamily: 'Inter-500',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  labelActive: {
    fontFamily: 'Inter-700',
  },
});
