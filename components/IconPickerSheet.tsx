import React, { useCallback, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
import { materialIconList } from '@/utils/common-data';

interface Props {
  value: string;
  onChange: (name: string) => void;
  previewColor: string;
  label?: string;
  showDivider?: boolean;
  error?: string | null;
}

const GRID_ROWS = 3;
const ITEM_WIDTH = 64;
const ITEM_HEIGHT = 64;
const AVATAR_SIZE = 44;
const ROW_GAP = Spacing.sm;
const COLUMN_GAP = Spacing.sm;
const GRID_BLOCK_HEIGHT = GRID_ROWS * ITEM_HEIGHT + (GRID_ROWS - 1) * ROW_GAP;

// materialIconList is grouped by category (Food, Finance, ...) for the old
// vertical picker - flattened here since the horizontal-scroll grid reads as
// one continuous strip. Group order is preserved, so related icons still
// cluster together even without visible section labels.
const ALL_ICONS = Object.values(materialIconList).flat();

export default function IconPickerSheet({
  value,
  onChange,
  previewColor,
  label = 'Icon',
  showDivider,
  error,
}: Props) {
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  // The selected icon leads the grid so it's the first thing you see on
  // reopen, then arranged for the horizontal-scroll grid's column-fill order
  // to still read left-to-right, top-to-bottom.
  const orderedIcons = useMemo(() => {
    const rest = ALL_ICONS.filter((name) => name !== value);
    const rowMajor = ALL_ICONS.includes(value) ? [value, ...rest] : ALL_ICONS;
    return toColumnMajorOrder(rowMajor, GRID_ROWS);
  }, [value]);

  const open = useCallback(() => sheetRef.current?.present(), []);
  const close = useCallback(() => sheetRef.current?.dismiss(), []);

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
        icon={
          <View style={[styles.rowAvatar, { backgroundColor: previewColor || colors.categoryFallbackBg }]}>
            <MaterialIcons name={getCategoryIconName(value)} size={16} color={colors.onPrimary} />
          </View>
        }
        label={label}
        showDivider={showDivider}
        error={error}
        onPress={open}
        trailing={<MaterialIcons name="chevron-right" size={20} color={colors.arrowColor} />}>
        <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
          {value || 'Choose an icon'}
        </Text>
      </RowField>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['50%']}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.cardBg }}
        handleComponent={null}>
        <BottomSheetView style={[styles.sheetContent, { paddingBottom: 20 + insets.bottom }]}>
          <Text style={[styles.sheetTitle, { color: colors.title }]}>Choose an icon</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[styles.grid, { height: GRID_BLOCK_HEIGHT }]}>
              {orderedIcons.map((iconName) => {
                const active = iconName === value;
                return (
                  <Pressable
                    key={iconName}
                    style={styles.cell}
                    onPress={() => {
                      onChange(iconName);
                      close();
                    }}>
                    <View
                      style={[
                        styles.cellAvatar,
                        { backgroundColor: previewColor || colors.categoryFallbackBg },
                        active && { borderWidth: 2, borderColor: colors.primary },
                      ]}>
                      <MaterialIcons name={iconName as any} size={20} color={colors.onPrimary} />
                      {active && (
                        <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                          <MaterialIcons name="check" size={11} color={colors.onPrimary} />
                        </View>
                      )}
                    </View>
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
  rowAvatar: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-600',
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingTop: Spacing.lg,
    flex: 1,
  },
  sheetTitle: {
    fontSize: FontSize.md,
    fontFamily: 'Inter-600',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    rowGap: ROW_GAP,
    columnGap: COLUMN_GAP,
  },
  cell: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
