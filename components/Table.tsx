import { Itransaction } from '@/types';
import { formatToCurrency } from '@/utils/formatter';
import { deviceWidth } from '@/utils/functions';
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '@/contexts/ThemedContext';

const width = deviceWidth();
const tableWidth = width - 40;

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
      <View style={[styles.table, { borderColor: colors.borderColor }]}>
        {/* Table Header with Gradient */}
        <LinearGradient
          colors={['#705AD4', '#6B5DE6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerRow}>
          <View style={{ width: firstColumnWidth }}>
            <Text style={[styles.cell, styles.headerText]}>Type</Text>
          </View>
          <View style={{ width: secondColumnWidth }}>
            <Text style={[styles.cell, styles.headerText]}>Amount</Text>
          </View>
          <View style={{ width: thirdColumnWidth }}>
            <Text style={[styles.cell, styles.headerText]}>Count</Text>
          </View>
        </LinearGradient>

        {/* Income Row */}
        <View
          key={'income'}
          style={[
            styles.row,
            { backgroundColor: colors.bottomBarBackground, borderBottomColor: colors.borderColor },
          ]}>
          <View style={{ width: firstColumnWidth }}>
            <Text style={[styles.cell, { color: colors.text, fontFamily: 'Inter-300' }]}>
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
            { backgroundColor: colors.bottomBarBackground, borderBottomColor: colors.borderColor },
          ]}>
          <View style={{ width: firstColumnWidth }}>
            <Text style={[styles.cell, { color: colors.text, fontFamily: 'Inter-300' }]}>
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
            { backgroundColor: colors.bottomBarBackground, borderBottomColor: colors.borderColor },
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
    borderColor: '#2D2A40',
    borderRadius: 2,
    marginVertical: 16,
    height: 'auto',
    borderBottomWidth: 0,
    backgroundColor: '#161421',
    width: tableWidth,
    overflow: 'hidden', // important to keep gradient corners rounded
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
    color: '#D1CFE9',
    fontFamily: 'Inter-400',
  },
  header: {
    backgroundColor: '#2A2740',
  },
  headerText: {
    fontFamily: 'Inter-600',
    color: '#E6E6FA',
    fontSize: 14,
  },
});
