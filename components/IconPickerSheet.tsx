import React, { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';
import { Spacing } from '@/utils/Spacing';
import RowField from '@/components/RowField';
import { getCategoryIconName } from '@/utils/categoryIcon';
import { materialIconList } from '@/utils/common-data';

interface Props {
  value: string;
  onChange: (name: string) => void;
  previewColor: string;
  label?: string;
  showDivider?: boolean;
  error?: string | null;
}

const ITEM_WIDTH = 64;
const ITEM_HEIGHT = 64;
const AVATAR_SIZE = 44;
const ROW_GAP = Spacing.sm;
const COLUMN_GAP = Spacing.sm;

// Kept grouped by category (Food, Finance, ...) instead of flattened - each
// section renders under its own title, so picking an icon means scanning one
// familiar group instead of the whole flat set at once.
const ICON_SECTIONS = Object.entries(materialIconList);

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

  const open = useCallback(() => sheetRef.current?.present(), []);
  const close = useCallback(() => sheetRef.current?.dismiss(), []);
  const previewIconColor = previewColor || colors.categoryFallbackIcon;

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
          <View style={[styles.rowAvatar, { backgroundColor: `${previewIconColor}2E` }]}>
            <MaterialIcons name={getCategoryIconName(value)} size={16} color={previewIconColor} />
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
        snapPoints={['75%']}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.cardBg }}
        handleComponent={null}>
        <BottomSheetScrollView
          style={styles.sheetContent}
          contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.sheetTitle, { color: colors.title }]}>Choose an icon</Text>
          {ICON_SECTIONS.map(([section, icons]) => (
            <View key={section} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.lighterTitle }]}>{section}</Text>
              <View style={styles.grid}>
                {icons.map((iconName) => {
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
                          { backgroundColor: `${previewIconColor}2E` },
                          active && { borderWidth: 2, borderColor: colors.primary },
                        ]}>
                        <MaterialIcons name={iconName as any} size={20} color={previewIconColor} />
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
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </BottomSheetScrollView>
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
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    marginBottom: Spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
