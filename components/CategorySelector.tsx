import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ICategory } from '@/types';
import { useThemeContext } from '@/contexts/ThemedContext';

interface Props {
  categories: ICategory[] | [];
  selected: number | string | string[] | undefined;
  onSelect: (id: string) => void;
  multiple?: boolean;
}

const MAX_VISIBLE = 7;

export default function CategorySelector({ categories, selected, onSelect, multiple = false }: Props) {
  const { colors, theme } = useThemeContext();
  const [showAll, setShowAll] = useState(false);

  const isSelected = (id: string) =>
    multiple ? (selected as string[] | undefined)?.includes(id) ?? false : selected === id;

  const reorderedCategories = useMemo(() => {
    if (multiple || !selected) return categories;
    const selectedItem = categories.find((item) => item.exp_tc_id === selected);
    const otherItems = categories.filter((item) => item.exp_tc_id !== selected);
    return selectedItem ? [selectedItem, ...otherItems] : categories;
  }, [categories, selected, multiple]);

  const visibleItems = showAll ? reorderedCategories : reorderedCategories.slice(0, MAX_VISIBLE);


  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {visibleItems.map((item) => (
          <View style={{ padding: 5 }} key={item.exp_tc_id}>
            <Pressable
              style={[
                {
                  alignItems: 'center',
                  flexDirection: 'row',
                  borderWidth: 1,
                  borderColor: colors.borderColor,
                  borderRadius: 50,
                  width: 'auto',
                },
                {
                  backgroundColor: isSelected(item.exp_tc_id) ? item.exp_tc_icon_bg_color : undefined,
                },
              ]}
              onPress={() => onSelect(item.exp_tc_id)}>
              <View
                style={{
                  backgroundColor: item.exp_tc_icon_bg_color,
                  padding: 5,
                  borderRadius: 50,
                }}>
                <MaterialIcons
                  name={item.exp_tc_icon as React.ComponentProps<typeof MaterialIcons>['name']}
                  size={16}
                  color={colors.onPrimary}
                />
              </View>
              <Text
                style={{
                  fontFamily: 'Inter-500',
                  fontSize: 12,
                  padding: 5,
                  color:
                    isSelected(item.exp_tc_id) || theme !== 'light'
                      ? colors.onPrimary
                      : colors.title,
                }}>
                {item.exp_tc_label}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      {categories.length > MAX_VISIBLE && (
        <Pressable
          onPress={() => setShowAll((prev) => !prev)}
          style={{
            marginTop: 10,
            alignSelf: 'flex-start',
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: 'transparent',
            paddingVertical: 5,
            borderRadius: 50,
            marginBottom: 5,
            backgroundColor: colors.primary,
          }}>
          <Text style={{ color: colors.onPrimary, fontSize: 12, fontFamily: 'Inter-600' }}>
            {showAll ? 'View Less' : 'View More'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
