import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useThemeContext } from '@/contexts/ThemedContext';
import { formatToCurrency } from '@/utils/formatter';
import { getBudgetTier } from '@/utils/budgetAlerts';
import { FontSize } from '@/utils/Typography';

export default function CategoryBudgetTable({
  totalSpent,
  totalBudget,
  totalRemaining,
}: {
  totalSpent: number;
  totalBudget: number;
  totalRemaining: number;
}) {
  const { colors } = useThemeContext();
  const pct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const tier = getBudgetTier(pct, colors);
  const over = totalRemaining < 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.captionRow}>
        <Text style={[styles.caption, { color: colors.description }]}>
          Limit {formatToCurrency(totalBudget)}
        </Text>
        <Text style={[styles.captionStrong, { color: tier.color }]}>
          Spent {formatToCurrency(totalSpent)}
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: colors.inputColor }]}>
        <View
          style={[
            styles.fill,
            { width: `${Math.min(pct, 100)}%`, backgroundColor: tier.color },
          ]}
        />
      </View>

      <View style={styles.captionRow}>
        <Text style={[styles.caption, { color: colors.description }]}>
          {pct.toFixed(0)}% used
        </Text>
        <Text
          style={[styles.captionStrong, { color: over ? colors.expense : colors.title }]}>
          {formatToCurrency(Math.abs(totalRemaining))} {over ? 'over' : 'left'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginVertical: 8,
    gap: 6,
  },
  captionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caption: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
  },
  captionStrong: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-700',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
