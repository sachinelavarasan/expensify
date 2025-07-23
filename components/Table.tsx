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
              { width: columnWidth, color: '#8880A0', fontFamily: 'Inter-600' },
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
              { width: columnWidth, color: '#8880A0', fontFamily: 'Inter-600' },
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
              { width: columnWidth, color: '#8880A0', fontFamily: 'Inter-600' },
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
    borderColor: '#3A3A50',
    borderRadius: 4,
    overflow: 'hidden',
    margin: 16,
    height: 'auto',
    maxHeight: 174,
    borderBottomWidth: 0,
    backgroundColor: '#1C1C20',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A50',
    backgroundColor: '#1C1C20',
  },
  cell: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#D0CDE1',
    textAlign: 'left',
  },
  header: {
    backgroundColor: '#2A2A35',
  },
  headerText: {
    fontWeight: '600',
    color: '#E0E0F0',
  },
});
