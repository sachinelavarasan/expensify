import React, { useCallback, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';
import { Spacing } from '@/utils/Spacing';
import RowField from '@/components/RowField';
import { getCategoryIconName } from '@/utils/categoryIcon';
import { toColumnMajorOrder } from '@/utils/gridLayout';
import { ICategory } from '@/types';

interface Props {
  icon?: React.ReactNode;
  label?: string;
  value: string | undefined;
  categories: ICategory[];
  onSelect: (id: string) => void;
  onAddCategory: () => void;
  error?: string | null;
  placeholder?: string;
}

const GRID_ROWS = 4;
// Item width + column gap keeps the same total column pitch (96) as before,
// so 4 columns still fit on screen at once - widening the gap without
// narrowing the item would push the 4th column off the edge.
const ITEM_WIDTH = 84;
const ITEM_HEIGHT = 100;
const ITEM_LABEL_WIDTH = 68;
const AVATAR_SIZE = 48;
const ROW_GAP = Spacing.sm;
const COLUMN_GAP = Spacing.md;
// The grid's height is fixed regardless of category count (it only grows
// horizontally), so the sheet's total height is fully predictable - a fixed
// snap point avoids both dynamic-sizing's overflow risk on short screens and
// the gesture hand-off issues that came with it. Row gap has to be folded
// into this height, or the 4th item per column would overflow the container
// and wrap into the next column early, throwing off the "4 rows" layout.
const HEADER_BLOCK_HEIGHT = 46;
const GRID_BLOCK_HEIGHT = GRID_ROWS * ITEM_HEIGHT + (GRID_ROWS - 1) * ROW_GAP;

type GridEntry = { kind: 'category'; item: ICategory } | { kind: 'add' };

// Same trigger-row + bottom-sheet shape as RowSelectInput, but the sheet body
// is a grid instead of a flat list - categories read better as icons than as
// a text list, and a fixed-row, horizontally-scrolling grid (flexWrap on a
// column-direction container) shows far more options per screen than the
// inline CategorySelector strip this replaces here.
export default function CategoryPickerSheet({
  icon,
  label,
  value,
  categories,
  onSelect,
  onAddCategory,
  error,
  placeholder = 'Choose a category',
}: Props) {
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(
    () => [Spacing.lg + HEADER_BLOCK_HEIGHT + GRID_BLOCK_HEIGHT + 20 + insets.bottom],
    [insets.bottom],
  );

  const selected = categories.find((item) => item.exp_tc_id === value);

  // The selected category leads the grid so it's the first thing you see on
  // reopen; everything else keeps the user's own category ordering.
  const orderedCategories = useMemo(() => {
    const sorted = [...categories].sort((a, b) => a.exp_tc_sort_order - b.exp_tc_sort_order);
    if (!value) return sorted;
    const rest = sorted.filter((item) => item.exp_tc_id !== value);
    return selected ? [selected, ...rest] : sorted;
  }, [categories, value, selected]);

  const gridEntries = useMemo<GridEntry[]>(() => {
    const rowMajorEntries: GridEntry[] = [
      ...orderedCategories.map((item) => ({ kind: 'category' as const, item })),
      { kind: 'add' as const },
    ];
    return toColumnMajorOrder(rowMajorEntries, GRID_ROWS);
  }, [orderedCategories]);

  const open = useCallback(() => {
    sheetRef.current?.present();
  }, []);

  const close = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        style={{ backgroundColor: colors.scrim }}
      />
    ),
    [colors],
  );

  return (
    <>
      <RowField
        icon={icon}
        label={label}
        error={error}
        onPress={open}
        trailing={<MaterialIcons name="chevron-right" size={20} color={colors.arrowColor} />}>
        <Text
          style={[styles.value, { color: selected ? colors.text : colors.inputPlaceholder }]}
          numberOfLines={1}>
          {selected ? selected.exp_tc_label : placeholder}
        </Text>
      </RowField>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.cardBg }}
        handleComponent={null}>
        <BottomSheetView style={[styles.sheetContent, { paddingBottom: 20 + insets.bottom }]}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderSide} />
            <Text style={[styles.sheetTitle, { color: colors.title }]}>Choose a category</Text>
            <View style={[styles.sheetHeaderSide, styles.sheetHeaderSideRight]}>
              <TouchableOpacity
                onPress={() => {
                  close();
                  onAddCategory();
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[styles.editLink, { color: colors.primary }]}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[styles.grid, { height: GRID_BLOCK_HEIGHT }]}>
              {gridEntries.map((entry) => {
                if (entry.kind === 'add') {
                  return (
                    <Pressable
                      key="add-new"
                      style={styles.gridItem}
                      onPress={() => {
                        close();
                        onAddCategory();
                      }}>
                      <View style={[styles.avatar, styles.addAvatar, { borderColor: colors.inputBorder }]}>
                        <MaterialIcons name="add" size={22} color={colors.description} />
                      </View>
                      <Text numberOfLines={1} style={[styles.itemLabel, { color: colors.description }]}>
                        Add new
                      </Text>
                    </Pressable>
                  );
                }

                const { item } = entry;
                const active = item.exp_tc_id === value;
                return (
                  <Pressable
                    key={item.exp_tc_id}
                    style={styles.gridItem}
                    onPress={() => {
                      onSelect(item.exp_tc_id);
                      close();
                    }}>
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: item.exp_tc_icon_bg_color || colors.categoryFallbackBg },
                        active && { borderWidth: 2, borderColor: colors.primary },
                      ]}>
                      <MaterialIcons
                        name={getCategoryIconName(item.exp_tc_icon)}
                        size={22}
                        color={colors.onPrimary}
                      />
                      {active && (
                        <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                          <MaterialIcons name="check" size={11} color={colors.onPrimary} />
                        </View>
                      )}
                    </View>
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.itemLabel,
                        { color: active ? colors.title : colors.description },
                        active && styles.itemLabelActive,
                      ]}>
                      {item.exp_tc_label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  value: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-600',
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingTop: Spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sheetHeaderSide: {
    flex: 1,
  },
  sheetHeaderSideRight: {
    alignItems: 'flex-end',
  },
  sheetTitle: {
    fontSize: FontSize.md,
    fontFamily: 'Inter-600',
    textAlign: 'center',
  },
  editLink: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-600',
  },
  grid: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    rowGap: ROW_GAP,
    columnGap: COLUMN_GAP,
  },
  gridItem: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAvatar: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  itemLabel: {
    width: ITEM_LABEL_WIDTH,
    fontSize: FontSize.xs,
    fontFamily: 'Inter-500',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  itemLabelActive: {
    fontFamily: 'Inter-700',
  },
});
