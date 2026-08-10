import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemedContext';

interface Option {
  id: string | number;
  label: string;
}

interface Props {
  options: Option[];
  value: string | number | (string | number)[];
  onChange: (id: string | number) => void;
  label?: string;
  // 'tile' wraps each option in a bordered tile with a radio-dot + checkmark,
  // for option sets where "pick exactly one" should stay visually explicit
  // (e.g. Transaction Type). 'chip' is a plain wrapped pill row with no dot,
  // for longer or more casual single-select lists (e.g. Bank Account).
  variant?: 'tile' | 'chip';
  // When true, `value` is treated as an array and onChange is called once per
  // tap - the caller owns the add/remove toggle logic (see toggleCategory-style
  // handlers), same contract as CategorySelector's `multiple` prop.
  multiple?: boolean;
}

export default function ChipSelect({
  options,
  value,
  onChange,
  label,
  variant = 'chip',
  multiple = false,
}: Props) {
  const { colors } = useThemeContext();
  const isTile = variant === 'tile';

  return (
    <View>
      {!!label && <Text style={[styles.label, { color: colors.title }]}>{label}</Text>}
      <View style={isTile ? styles.tileGrid : styles.chipRow}>
        {options.map((option) => {
          const active = multiple
            ? (value as (string | number)[]).includes(option.id)
            : option.id == value;
          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => onChange(option.id)}
              style={[
                isTile ? styles.tile : styles.chip,
                {
                  borderColor: active ? colors.primary : colors.inputBorder,
                  backgroundColor: active
                    ? isTile
                      ? `${colors.primary}1A`
                      : colors.primary
                    : colors.inputColor,
                },
              ]}>
              {isTile && (
                <View
                  style={[
                    styles.dot,
                    {
                      borderColor: active ? colors.primary : colors.inputBorder,
                      backgroundColor: active ? colors.primary : 'transparent',
                    },
                  ]}>
                  {active && <MaterialIcons name="check" size={10} color={colors.onPrimary} />}
                </View>
              )}
              <Text
                style={[
                  styles.optionLabel,
                  { color: active ? (isTile ? colors.primary : colors.onPrimary) : colors.title },
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontFamily: 'Inter-500',
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '47%',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  optionLabel: {
    fontSize: 13,
    fontFamily: 'Inter-600',
  },
});
