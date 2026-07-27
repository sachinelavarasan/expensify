import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PieChart, pieDataItem } from 'react-native-gifted-charts';

import { useThemeContext } from '@/contexts/ThemedContext';
import { formatToCurrency } from '@/utils/formatter';
import { Spacing } from '@/utils/Spacing';
import { FontSize } from '@/utils/Typography';

interface Props {
  income: number;
  expense: number;
}

export default function BreakdownChart({ income, expense }: Props) {
  const { colors } = useThemeContext();
  const total = income + expense;
  const isEmpty = total === 0;

  const segments = [
    { key: 'income', label: 'Income', value: income, color: colors.income },
    { key: 'expense', label: 'Expense', value: expense, color: colors.expense },
  ];

  const pieData: pieDataItem[] = segments.map((segment) => ({
    value: isEmpty ? 1 : segment.value,
    color: isEmpty ? colors.arrowColor : segment.color,
  }));

  return (
    <View
      style={[styles.container, { backgroundColor: colors.inputColor, borderColor: colors.inputBorder }]}>
      <Text style={[styles.title, { color: colors.title }]}>Breakdown</Text>

      {isEmpty ? (
        <Text style={[styles.emptyText, { color: colors.description }]}>
          No transactions yet to show a breakdown.
        </Text>
      ) : (
        <View style={styles.body}>
          <View style={styles.donutWrap}>
            <PieChart
              data={pieData}
              radius={72}
              donut
              isAnimated
              animationDuration={500}
              innerCircleColor={colors.cardBg}
              innerRadius={50}
              centerLabelComponent={() => (
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.centerLabel, { color: colors.description }]}>Total</Text>
                  <Text style={[styles.centerValue, { color: colors.title }]} numberOfLines={1}>
                    {formatToCurrency(total)}
                  </Text>
                </View>
              )}
            />
          </View>

          <View style={styles.legendRow}>
            {segments.map((segment) => (
              <View key={segment.key} style={styles.legendItem}>
                <View style={styles.legendHeader}>
                  <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
                  <Text style={[styles.legendLabel, { color: colors.description }]}>
                    {segment.label}
                  </Text>
                </View>
                <Text style={[styles.legendValue, { color: colors.title }]} numberOfLines={1}>
                  {formatToCurrency(segment.value)}
                </Text>
                <Text style={[styles.legendPercent, { color: colors.description }]}>
                  {((segment.value / total) * 100).toFixed(0)}% of total
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.md,
    marginTop: 10,
    minHeight: 300,
  },
  title: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-600',
    marginBottom: Spacing.md,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  donutWrap: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  centerLabel: {
    fontSize: 10,
    fontFamily: 'Inter-500',
  },
  centerValue: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    marginTop: 1,
  },
  legendRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  legendItem: {
    flex: 1,
    gap: 3,
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
  },
  legendValue: {
    fontSize: FontSize.md,
    fontFamily: 'Inter-600',
  },
  legendPercent: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
  },
  emptyText: {
    height: 100,
    textAlignVertical: 'center',
    textAlign: 'center',
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
  },
});
