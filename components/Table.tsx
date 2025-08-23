import { Itransaction } from '@/types';
import { formatToCurrency } from '@/utils/formatter';
import { deviceWidth } from '@/utils/functions';
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const width = deviceWidth();
const tableWidth = width - 52;

export default function TableView({ transactions }: { transactions: Itransaction[] }) {
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
      <View style={styles.table}>
        {/* Table Header with Gradient */}
        <LinearGradient
          colors={['#6900FF', '#6B5DE6']}
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
        <View key={'income'} style={styles.row}>
          <View style={{ width: firstColumnWidth }}>
            <Text style={[styles.cell, { color: '#5A5A6E', fontFamily: 'Inter-500' }]}>Income</Text>
          </View>
          <View style={{ width: secondColumnWidth }}>
            <Text style={[styles.cell]} numberOfLines={3}>
              {formatToCurrency(income)}
            </Text>
          </View>
          <View style={{ width: thirdColumnWidth }}>
            <Text style={[styles.cell]}>
              {transactions.filter((tx) => tx.exp_tt_id === 2).length}
            </Text>
          </View>
        </View>

        {/* Expense Row */}
        <View key={'expense'} style={styles.row}>
          <View style={{ width: firstColumnWidth }}>
            <Text style={[styles.cell, { color: '#5A5A6E', fontFamily: 'Inter-500' }]}>
              Expense
            </Text>
          </View>
          <View style={{ width: secondColumnWidth }}>
            <Text style={[styles.cell]} numberOfLines={3}>
              {formatToCurrency(expense)}
            </Text>
          </View>
          <View style={{ width: thirdColumnWidth }}>
            <Text style={[styles.cell, { width: thirdColumnWidth }]}>
              {transactions.filter((tx) => tx.exp_tt_id === 1).length}
            </Text>
          </View>
        </View>

        {/* Overall Row */}
        <View key={'overall'} style={styles.row}>
          <View style={{ width: firstColumnWidth }}>
            <Text style={[styles.cell, { color: '#1E1E1E', fontFamily: 'Inter-500' }]}>
              Over All
            </Text>
          </View>
          <View style={{ width: secondColumnWidth }}>
            <Text style={[styles.cell]} numberOfLines={3}>
              {formatToCurrency(income - expense)}
            </Text>
          </View>
          <View style={{ width: thirdColumnWidth }}>
            <Text style={[styles.cell]}>{transactions.length}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 0.5,
    borderColor: '#E2E2EA',
    borderRadius: 4,
    margin: 16,
    borderBottomWidth: 0,
    width: tableWidth,
    overflow: 'hidden', // important to keep gradient corners rounded
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E2EA',
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  cell: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#282343',
  },
  headerText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-600',
  },
});
