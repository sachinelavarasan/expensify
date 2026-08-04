import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';
import { Spacing } from '@/utils/Spacing';

interface Option {
  id: string | number;
  label: string;
  count?: number;
}

interface Props {
  options: Option[];
  value: string | number;
  onChange: (id: string | number) => void;
  label?: string;
  disabled?: boolean;
}

export default function SegmentedControl({ options, value, onChange, label, disabled }: Props) {
  const { colors } = useThemeContext();

  return (
    <View>
      {label ? <Text style={[styles.label, { color: colors.title }]}>{label}</Text> : null}
      <View style={[styles.track, { backgroundColor: colors.barBackground }]}>
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <TouchableOpacity
              key={option.id}
              disabled={disabled}
              activeOpacity={0.75}
              onPress={() => onChange(option.id)}
              style={[
                styles.segment,
                selected && {
                  backgroundColor: colors.cardBg,
                  shadowColor: colors.shadow,
                  ...styles.segmentSelected,
                },
              ]}>
              <View style={styles.segmentContent}>
                <Text
                  style={[
                    styles.segmentLabel,
                    { color: selected ? colors.title : colors.description },
                  ]}>
                  {option.label}
                </Text>
                {option.count !== undefined ? (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: selected ? colors.primary : colors.barBackground },
                    ]}>
                    <Text
                      style={[
                        styles.badgeLabel,
                        { color: selected ? colors.cardBg : colors.description },
                      ]}>
                      {option.count}
                    </Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    marginBottom: Spacing.sm,
  },
  track: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: 9,
  },
  segmentSelected: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentLabel: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-600',
  },
  segmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: {
    fontSize: FontSize.xs,
    fontFamily: 'Inter-600',
  },
});
