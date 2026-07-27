import { Itransaction } from '@/types';
import { formatToCurrency } from '@/utils/formatter';
import { deviceWidth } from '@/utils/functions';
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { useThemeContext } from '@/contexts/ThemedContext';

const width = deviceWidth();
const tableWidth = width - 30;

export default function BudgetTable({
  totalSpent,
  totalBudget,
  totalRemaining,
}: {
  totalSpent: number;
  totalBudget: number;
  totalRemaining: number;
}) {
  const { colors } = useThemeContext();
  const firstColumnWidth = Math.round(tableWidth * 0.3);
  const secondColumnWidth = Math.round(tableWidth * 0.4);
  const thirdColumnWidth = Math.round(tableWidth * 0.3);

  return (
    <ScrollView
      horizontal
      style={{
        flex: 1,
      }}>
      <View style={[styles.table]}>
        <View style={styles.headerRow}>
          <View style={{ width: firstColumnWidth }}>
            <Text style={[styles.cell, { color: colors.title }]}>Total Budget</Text>
          </View>
          <View style={{ width: secondColumnWidth }}>
            <Text style={[styles.cell, { color: colors.title }]}>Total Spent</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  table: {
    marginVertical: 16,
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
    flex: 1,
    paddingVertical: 3,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter-400',
  },
  headerText: {
    fontFamily: 'Inter-600',
    fontSize: 14,
  },
});
