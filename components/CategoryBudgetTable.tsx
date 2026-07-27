import { formatToCurrency } from '@/utils/formatter';
import { deviceWidth } from '@/utils/functions';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useThemeContext } from '@/contexts/ThemedContext';

const width = deviceWidth();
const tableWidth = width - 45;

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
  const firstColumnWidth = Math.round(tableWidth * 0.33);
  const secondColumnWidth = Math.round(tableWidth * 0.33);
  const thirdColumnWidth = Math.round(tableWidth * 0.33);
  return (
    <View>
      <View style={[styles.table]}>
        <View style={styles.headerRow}>
          <View style={{ width: firstColumnWidth }}>
            <Text style={[styles.cell, { color: colors.title }]}>Limit</Text>
          </View>
          <View style={{ width: secondColumnWidth }}>
            <Text style={[styles.cell, { color: colors.title }]}>Spent</Text>
          </View>
          <View style={{ width: thirdColumnWidth }}>
            <Text style={[styles.cell, { color: colors.title }]}>Remaining</Text>
          </View>
        </View>

        <View key={'income'} style={[styles.row]}>
          <View style={{ width: firstColumnWidth }}>
            <Text style={[styles.cell, styles.headerText, { color: colors.monthSwitcher }]}>
              {formatToCurrency(totalBudget)}
            </Text>
          </View>
          <View style={{ width: secondColumnWidth }}>
            <Text
              style={[styles.cell, styles.headerText, { color: colors.monthSwitcher }]}
              numberOfLines={3}>
              {formatToCurrency(totalSpent)}
            </Text>
          </View>
          <View style={{ width: thirdColumnWidth }}>
            <Text style={[styles.cell, styles.headerText, { color: colors.monthSwitcher }]}>
              {formatToCurrency(totalRemaining)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    marginVertical: 8,
    height: 'auto',
    width: tableWidth,
    overflow: 'hidden',
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
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter-400',
  },
  headerText: {
    fontFamily: 'Inter-600',
    fontSize: 14,
  },
});
