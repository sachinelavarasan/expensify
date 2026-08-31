import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BarChart, barDataItem } from 'react-native-gifted-charts';

import { useSpendTrend } from '@/hooks/useTransaction';
import { useThemeContext } from '@/contexts/ThemedContext';
import { formatToCurrency } from '@/utils/formatter';
import { deviceWidth } from '@/utils/functions';
import { Spacing } from '@/utils/Spacing';
import { FontSize } from '@/utils/Typography';

const chartWidth = deviceWidth() - 30 - 40;

// Y-axis needs short, fixed-width labels regardless of magnitude - unlike
// formatToCurrency (used for on-screen amounts elsewhere), which switches to
// full comma-grouped numbers in the 1,000-99,999 range and can overflow the
// axis's label column.
function compactAxisLabel(value: number): string {
  const abs = Math.abs(value);
  const prefix = value < 0 ? '-' : '';
  if (abs >= 10000000) return `${prefix}${(abs / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `${prefix}${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${prefix}${(abs / 1000).toFixed(1)}K`;
  return `${prefix}${abs.toFixed(0)}`;
}

export default function SpendTrendChart({ months = 6 }: { months?: number }) {
  const { colors } = useThemeContext();
  const { trend, loading } = useSpendTrend(months);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const isEmpty = trend.length > 0 && trend.every((point) => !point.income && !point.expense);

  const barData = useMemo(() => {
    const data: barDataItem[] = [];
    trend.forEach((point, index) => {
      const isLastMonth = index === trend.length - 1;
      const incomeIndex = index * 2;
      const expenseIndex = index * 2 + 1;

      data.push({
        value: point.income,
        frontColor: colors.income,
        spacing: 2,
        barBorderTopLeftRadius: 4,
        barBorderTopRightRadius: 4,
        onPress: () => setSelectedIndex(incomeIndex),
        topLabelComponent: () =>
          selectedIndex === incomeIndex ? (
            <Text style={[styles.valueLabel, { color: colors.income }]}>
              {formatToCurrency(point.income)}
            </Text>
          ) : null,
      });
      data.push({
        value: point.expense,
        frontColor: colors.expense,
        spacing: isLastMonth ? 4 : 12,
        barBorderTopLeftRadius: 4,
        barBorderTopRightRadius: 4,
        label: point.label,
        labelTextStyle: { color: colors.description, fontSize: FontSize.sm },
        onPress: () => setSelectedIndex(expenseIndex),
        topLabelComponent: () =>
          selectedIndex === expenseIndex ? (
            <Text style={[styles.valueLabel, { color: colors.expense }]}>
              {formatToCurrency(point.expense)}
            </Text>
          ) : null,
      });
    });
    return data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trend, colors, selectedIndex]);

  return (
    <View
      style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}
      accessibilityLabel={`Income and expense trend for the last ${months} months`}>
      <View style={styles.headerRow}>
        <View style={{ flexShrink: 1 }}>
          <Text style={[styles.title, { color: colors.title }]} numberOfLines={1}>
            Income vs Expense
          </Text>
          <Text style={[styles.subtitle, { color: colors.lighterTitle }]}>
            Last {months} months
          </Text>
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
            <Text style={[styles.legendText, { color: colors.description }]}>Income</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
            <Text style={[styles.legendText, { color: colors.description }]}>Expense</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator animating color={colors.primary} />
        </View>
      ) : isEmpty ? (
        <Text style={[styles.emptyText, { color: colors.description }]}>
          No transactions yet to show a trend.
        </Text>
      ) : (
        <BarChart
          key={trend.map((point) => `${point.month}:${point.income}:${point.expense}`).join('|')}
          data={barData}
          width={chartWidth}
          height={140}
          barWidth={10}
          initialSpacing={8}
          endSpacing={8}
          yAxisLabelWidth={38}
          noOfSections={4}
          isAnimated
          animationDuration={400}
          yAxisThickness={0}
          xAxisThickness={0}
          xAxisLabelTextStyle={{ color: colors.description, fontSize: FontSize.xs }}
          yAxisTextStyle={{ color: colors.description, fontSize: FontSize.xs }}
          rulesType="dashed"
          rulesColor={colors.borderColor}
          formatYLabel={(label) => compactAxisLabel(Number(label))}
        />
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-600',
  },
  subtitle: {
    fontSize: FontSize.xs,
    fontFamily: 'Inter-500',
    marginTop: 1,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
  },
  valueLabel: {
    fontSize: 10,
    fontFamily: 'Inter-600',
    marginBottom: 2,
  },
  loaderContainer: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    height: 140,
    textAlignVertical: 'center',
    textAlign: 'center',
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
  },
});
