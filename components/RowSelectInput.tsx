import React, { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';
import { Spacing } from '@/utils/Spacing';
import RowField from '@/components/RowField';

interface Option {
  key: any;
  value: any;
}

interface Props {
  icon?: React.ReactNode;
  label?: string;
  sheetTitle?: string;
  options: Option[];
  value: string | number;
  onChange: (id: number | string) => void;
  placeholder?: string;
  error?: string | null;
  showDivider?: boolean;
  // Small secondary line under the value - e.g. a live data sample for the
  // currently selected option, so you can sanity-check the choice without
  // opening the sheet.
  hint?: string;
}

// Picks from a bottom sheet instead of an inline dropdown - matches the
// AttachmentPicker's action sheet elsewhere on this screen, and avoids a
// floating overlay that has to fight the rows below it for space.
export default function RowSelectInput({
  icon,
  label,
  sheetTitle,
  options,
  value,
  onChange,
  placeholder,
  error,
  showDivider,
  hint,
}: Props) {
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  const selectedOption = options.find((option) => option.key === value);

  const open = useCallback(() => {
    if (options.length === 0) return;
    sheetRef.current?.present();
  }, [options.length]);

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
        showDivider={showDivider}
        onPress={open}
        trailing={<MaterialIcons name="chevron-right" size={20} color={colors.arrowColor} />}>
        <Text
          style={[styles.value, { color: selectedOption ? colors.text : colors.inputPlaceholder }]}
          numberOfLines={1}>
          {selectedOption
            ? selectedOption.value
            : options.length === 0
              ? 'No options available'
              : placeholder}
        </Text>
        {!!hint && (
          <Text style={[styles.hint, { color: colors.description }]} numberOfLines={1}>
            {hint}
          </Text>
        )}
      </RowField>

      <BottomSheetModal
        ref={sheetRef}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.cardBg }}
        handleIndicatorStyle={{ backgroundColor: colors.borderColor }}>
        <BottomSheetFlatList
          data={options}
          keyExtractor={(item) => String(item.key)}
          contentContainerStyle={[styles.sheetContent, { paddingBottom: 20 + insets.bottom }]}
          ListHeaderComponent={
            <Text style={[styles.sheetTitle, { color: colors.title }]}>
              {sheetTitle || label || 'Choose an option'}
            </Text>
          }
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: colors.borderColor }]} />
          )}
          renderItem={({ item }) => {
            const active = item.key === value;
            return (
              <Pressable
                style={styles.optionRow}
                onPress={() => {
                  onChange(item.key);
                  close();
                }}>
                <Text
                  style={[
                    styles.optionText,
                    { color: active ? colors.primary : colors.title },
                    active && styles.optionTextActive,
                  ]}>
                  {item.value}
                </Text>
                {active && <MaterialIcons name="check" size={18} color={colors.primary} />}
              </Pressable>
            );
          }}
        />
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  value: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-600',
  },
  hint: {
    fontSize: FontSize.xs,
    fontFamily: 'Inter-400',
    marginTop: 2,
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingTop: 4,
  },
  sheetTitle: {
    fontSize: FontSize.md,
    fontFamily: 'Inter-600',
    marginBottom: Spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  optionText: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-500',
  },
  optionTextActive: {
    fontFamily: 'Inter-700',
  },
  separator: {
    height: 1,
  },
});
