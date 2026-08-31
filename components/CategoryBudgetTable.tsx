import { formatToCurrency } from '@/utils/formatter';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useThemeContext } from '@/contexts/ThemedContext';

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
  return (
    <View style={styles.table}>
      <View style={styles.headerRow}>
        <View style={styles.column}>
          <Text style={[styles.cell, { color: colors.title }]}>Limit</Text>
        </View>
        <View style={styles.column}>
          <Text style={[styles.cell, { color: colors.title }]}>Spent</Text>
        </View>
        <View style={styles.column}>
          <Text style={[styles.cell, { color: colors.title }]}>Remaining</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={[styles.cell, styles.headerText, { color: colors.monthSwitcher }]}>
            {formatToCurrency(totalBudget)}
          </Text>
        </View>
        <View style={styles.column}>
          <Text
            style={[styles.cell, styles.headerText, { color: colors.monthSwitcher }]}
            numberOfLines={3}>
            {formatToCurrency(totalSpent)}
          </Text>
        </View>
        <View style={styles.column}>
          <Text style={[styles.cell, styles.headerText, { color: colors.monthSwitcher }]}>
            {formatToCurrency(totalRemaining)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    marginVertical: 8,
  },
  column: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  cell: {
    paddingVertical: 1,
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Inter-400',
  },
  headerText: {
    fontFamily: 'Inter-700',
    fontSize: 18,
  },
});
