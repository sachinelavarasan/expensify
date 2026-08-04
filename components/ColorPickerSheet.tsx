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
import { toColumnMajorOrder } from '@/utils/gridLayout';
import { customColors } from '@/utils/common-data';

interface Props {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
  showDivider?: boolean;
  error?: string | null;
}

const GRID_ROWS = 3;
const ITEM_WIDTH = 84;
const ITEM_HEIGHT = 84;
const ITEM_LABEL_WIDTH = 68;
const SWATCH_SIZE = 44;
const ROW_GAP = Spacing.sm;
const COLUMN_GAP = Spacing.md;
const GRID_BLOCK_HEIGHT = GRID_ROWS * ITEM_HEIGHT + (GRID_ROWS - 1) * ROW_GAP;

export default function ColorPickerSheet({
  value,
  onChange,
  label = 'Color',
  showDivider,
  error,
}: Props) {
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  const selected = customColors.find((c) => c.hex === value);

  // The selected color leads the grid so it's the first thing you see on
  // reopen, then arranged for the horizontal-scroll grid's column-fill order
  // to still read left-to-right, top-to-bottom.
  const orderedColors = useMemo(() => {
    const rest = customColors.filter((c) => c.hex !== value);
    const rowMajor = selected ? [selected, ...rest] : customColors;
    return toColumnMajorOrder(rowMajor, GRID_ROWS);
  }, [value, selected]);

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
        icon={<View style={[styles.rowSwatch, { backgroundColor: value || colors.categoryFallbackBg }]} />}
        label={label}
        showDivider={showDivider}
        error={error}
        onPress={open}
        trailing={<MaterialIcons name="chevron-right" size={20} color={colors.arrowColor} />}>
        <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
          {selected ? selected.name : value || 'Choose a color'}
        </Text>
      </RowField>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['50%']}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.cardBg }}
        handleComponent={null}>
        <BottomSheetView style={[styles.sheetContent, { paddingBottom: 20 + insets.bottom }]}>
          <Text style={[styles.sheetTitle, { color: colors.title }]}>Choose a color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[styles.grid, { height: GRID_BLOCK_HEIGHT }]}>
              {orderedColors.map((item) => {
                const active = item.hex === value;
                return (
                  <Pressable
                    key={item.hex}
                    style={styles.cell}
                    onPress={() => {
                      onChange(item.hex);
                      close();
                    }}>
                    <View
                      style={[
                        styles.cellSwatch,
                        { backgroundColor: item.hex },
                        active && { borderWidth: 2, borderColor: colors.primary },
                      ]}>
                      {active && <MaterialIcons name="check" size={16} color="#fff" />}
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.cellName,
                        { color: active ? colors.title : colors.description },
                        active && styles.cellNameActive,
                      ]}>
                      {item.name}
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
  rowSwatch: {
    width: 22,
    height: 22,
    borderRadius: 7,
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
    paddingVertical: Spacing.sm,
  },
  cellSwatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellName: {
    width: ITEM_LABEL_WIDTH,
    fontSize: FontSize.xs,
    fontFamily: 'Inter-500',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  cellNameActive: {
    fontFamily: 'Inter-700',
  },
});
