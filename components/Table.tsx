import { Itransaction } from '@/types';
import { formattedAmount } from '@/utils/formatter';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function TableView({ transactions }: { transactions: Itransaction[] }) {
  const income = transactions
    .filter((tx) => tx.exp_tt_id === 2)
    .reduce((acc, tx) => acc + Number(tx.exp_ts_amount), 0);
  const expense = transactions
    .filter((tx) => tx.exp_tt_id === 1)
    .reduce((acc, tx) => acc + Number(tx.exp_ts_amount), 0);
  const columnWidth = (width - 56) / 3;
  return (
    <ScrollView horizontal>
      <View style={styles.table}>
        <View style={[styles.row, styles.header]}>
          <Text style={[styles.cell, styles.headerText]}>Type</Text>
          <Text style={[styles.cell, styles.headerText]}>Amount</Text>
          <Text style={[styles.cell, styles.headerText]}>Transactions</Text>
        </View>

        <View key={'income'} style={styles.row}>
          <Text
            style={[
              styles.cell,
              { width: columnWidth, color: '#a19bca', fontFamily: 'Inter-500' },
            ]}>
            Income
          </Text>
          <Text style={[styles.cell, { width: columnWidth }]}>{formattedAmount(income)}</Text>
          <Text style={[styles.cell, { width: columnWidth }]}>
            {transactions.filter((tx) => tx.exp_tt_id === 2).length}
          </Text>
        </View>
        <View key={'expense'} style={styles.row}>
          <Text
            style={[
              styles.cell,
              { width: columnWidth, color: '#a19bca', fontFamily: 'Inter-500' },
            ]}>
            Expense
          </Text>
          <Text style={[styles.cell, { width: columnWidth }]}>{formattedAmount(expense)}</Text>
          <Text style={[styles.cell, { width: columnWidth }]}>
            {transactions.filter((tx) => tx.exp_tt_id === 1).length}
          </Text>
        </View>
        <View key={'overall'} style={styles.row}>
          <Text
            style={[
              styles.cell,
              { width: columnWidth, color: '#ffffff', fontFamily: 'Inter-500' },
            ]}>
            Overall
          </Text>
          <Text style={[styles.cell, { width: columnWidth }]}>
            {formattedAmount(income - expense)}
          </Text>
          <Text style={[styles.cell, { width: columnWidth }]}>{transactions.length}</Text>
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
    overflow: 'hidden',
    margin: 16,
    height: 'auto',
    maxHeight: 174,
    borderBottomWidth: 0,
    backgroundColor: '#0a0911',
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
    textAlign: 'left',
  },
  header: {
    backgroundColor: '#1e1a32',
  },
  headerText: {
    fontWeight: '600',
    color: '#E0E0F0',
  },
});
