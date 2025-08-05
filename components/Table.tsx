import { Itransaction } from '@/types';
import { formatToCurrency } from '@/utils/formatter';
import { deviceWidth } from '@/utils/functions';
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const width = deviceWidth();
const tableWidth = width - 52;

export default function TableView({ transactions }: { transactions: Itransaction[] }) {
  const income = transactions
    .filter((tx) => tx.exp_tt_id === 2)
    .reduce((acc, tx) => acc + Number(tx.exp_ts_amount), 0);
  const expense = transactions
    .filter((tx) => tx.exp_tt_id === 1)
    .reduce((acc, tx) => acc + Number(tx.exp_ts_amount), 0);
  const firstColumnWidth = Math.round(tableWidth * 0.25);
  const secondColumnWidth = Math.round(tableWidth * 0.5);
  const thirdColumnWidth = Math.round(tableWidth * 0.25);


  return (
    <ScrollView
      horizontal
      style={{
        flex: 1,
      }}>
      <View style={styles.table}>
        <View style={[styles.row, styles.header]}>
          <View style={{ width: firstColumnWidth }}>
          <Text style={[styles.cell, styles.headerText]}>Type</Text>
          </View>
          <View style={{ width: secondColumnWidth }}>
          <Text style={[styles.cell, styles.headerText]}>Amount</Text>
          </View>
          <View style={{ width: thirdColumnWidth }}>
          <Text style={[styles.cell, styles.headerText]}>Count</Text>
          </View>
        </View>

        <View key={'income'} style={styles.row}>
          <View style={{ width: firstColumnWidth }}>
            <Text style={[styles.cell, { color: '#a19bca', fontFamily: 'Inter-500' }]}>Income</Text>
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
        <View key={'expense'} style={styles.row}>
          <View style={{ width: firstColumnWidth }}>
            <Text style={[styles.cell, { color: '#a19bca', fontFamily: 'Inter-500' }]}>
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
        <View key={'overall'} style={styles.row}>
          <View style={{ width: firstColumnWidth }}>
            <Text style={[styles.cell, { color: '#ffffff', fontFamily: 'Inter-500' }]}>
              OverAll
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
    borderWidth: 1,
    borderColor: '#1e1a32',
    borderRadius: 4,
    margin: 16,
    height: 'auto',
    // maxHeight: 174,
    borderBottomWidth: 0,
    backgroundColor: '#0a0911',
    width: tableWidth,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1a32',
    backgroundColor: '#0a0911',
  },
  cell: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#B3B1C4',
  },
  header: {
    backgroundColor: '#1e1a32',
  },
  headerText: {
    fontWeight: '600',
    color: '#E0E0F0',
  },
});
