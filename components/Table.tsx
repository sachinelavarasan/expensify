import { Itransaction } from '@/types';
import { formatToCurrency } from '@/utils/formatter';
import { deviceWidth } from '@/utils/functions';
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '@/contexts/ThemedContext';

const width = deviceWidth();
const tableWidth = width - 30;

export default function TableView({ transactions }: { transactions: Itransaction[] }) {
  const { colors } = useThemeContext();
  const income = transactions
    .filter((tx) => tx.exp_tt_id === 2)
    .reduce((acc, tx) => acc + Number(tx.exp_ts_amount), 0);
  const expense = transactions
    .filter((tx) => tx.exp_tt_id === 1)
    .reduce((acc, tx) => acc + Number(tx.exp_ts_amount), 0);
  const firstColumnWidth = Math.round(tableWidth * 0.3);
  const secondColumnWidth = Math.round(tableWidth * 0.45);
  const thirdColumnWidth = Math.round(tableWidth * 0.25);

  return (
    <ScrollView
      horizontal
      style={{
        flex: 1,
      }}>
      <View style={[styles.table, { borderColor: colors.inputBorder }]}>
        {/* Table Header with Gradient */}
        <LinearGradient
          colors={[colors.floatingBtnBg[1], colors.floatingBtnBg[0]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerRow}>
          <View style={{ width: firstColumnWidth }}>
            <Text style={[styles.cell, styles.headerText, { color: colors.onPrimary }]}>Type</Text>
          </View>
          <View style={{ width: secondColumnWidth }}>
            <Text style={[styles.cell, styles.headerText, { color: colors.onPrimary }]}>
              Amount
            </Text>
          </View>
          <View style={{ width: thirdColumnWidth }}>
            <Text style={[styles.cell, styles.headerText, { color: colors.onPrimary }]}>
              Count
            </Text>
          </View>
        </LinearGradient>

        {/* Income Row */}
        <View
          key={'income'}
          style={[
            styles.row,
            { backgroundColor: colors.inputColor, borderBottomColor: colors.inputBorder },
          ]}>
          <View style={{ width: firstColumnWidth }}>
            <Text style={[styles.cell, { color: colors.text, fontFamily: 'Inter-400' }]}>
              Income
            </Text>
          </View>
          <View style={{ width: secondColumnWidth }}>
            <Text style={[styles.cell, { color: colors.title }]} numberOfLines={3}>
              {formatToCurrency(income)}
            </Text>
          </View>
          <View style={{ width: thirdColumnWidth }}>
            <Text style={[styles.cell, { color: colors.title }]}>
              {transactions.filter((tx) => tx.exp_tt_id === 2).length}
            </Text>
          </View>
        </View>

        {/* Expense Row */}
        <View
          key={'expense'}
          style={[
            styles.row,
            { backgroundColor: colors.inputColor, borderBottomColor: colors.inputBorder },
          ]}>
          <View style={{ width: firstColumnWidth }}>
            <Text style={[styles.cell, { color: colors.text, fontFamily: 'Inter-400' }]}>
              Expense
            </Text>
          </View>
          <View style={{ width: secondColumnWidth }}>
            <Text style={[styles.cell, { color: colors.title }]} numberOfLines={3}>
              {formatToCurrency(expense)}
            </Text>
          </View>
          <View style={{ width: thirdColumnWidth }}>
            <Text style={[styles.cell, { color: colors.title, width: thirdColumnWidth }]}>
              {transactions.filter((tx) => tx.exp_tt_id === 1).length}
            </Text>
          </View>
        </View>

        {/* Overall Row */}
        <View
          key={'overall'}
          style={[
            styles.row,
            { backgroundColor: colors.inputColor, borderBottomColor: colors.inputBorder },
          ]}>
          <View style={{ width: firstColumnWidth }}>
            <Text style={[styles.cell, { color: colors.text, fontFamily: 'Inter-600' }]}>
              Over All
            </Text>
          </View>
          <View style={{ width: secondColumnWidth }}>
            <Text
              style={[styles.cell, { color: colors.title, fontFamily: 'Inter-600' }]}
              numberOfLines={3}>
              {formatToCurrency(income - expense)}
            </Text>
          </View>
          <View style={{ width: thirdColumnWidth }}>
            <Text style={[styles.cell, { color: colors.title, fontFamily: 'Inter-600' }]}>
              {transactions.length}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderRadius: 2,
    marginVertical: 16,
    height: 'auto',
    borderBottomWidth: 0,
    width: tableWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  cell: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-400',
  },
  headerText: {
    fontFamily: 'Inter-600',
    fontSize: 14,
  },
});
