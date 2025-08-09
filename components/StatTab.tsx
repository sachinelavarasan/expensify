import { Itransaction } from '@/types';
import { formatToCurrency } from '@/utils/formatter';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

export default function IncomeExpenseTabs({ transactions }: { transactions: Itransaction[] }) {
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');

  const incomeTransactions = transactions.filter((tx) => tx.exp_tt_id === 2);

  const expenseTransactions = transactions.filter((tx) => tx.exp_tt_id === 1);

  const groupByCategory = (transactions: Itransaction[]) => {
    return transactions.reduce((acc: { [key: string]: Itransaction[] }, tx) => {
      if (acc[tx.exp_ts_category]) {
        acc[tx.exp_ts_category].push(tx);
      } else {
        acc[tx.exp_ts_category] = [tx];
      }
      return acc;
    }, {});
  };

  const incomeByCategory = groupByCategory(incomeTransactions);
  const expenseByCategory = groupByCategory(expenseTransactions);

  const calculateCategoryMetrics = (
    categoryData: { [key: string]: Itransaction[] },
    totalAmount: number,
  ) => {
    return Object.entries(categoryData).map(([category, transactions]) => {
      const totalCategoryAmount = transactions.reduce((sum, tx) => {
        return sum + Number(tx.exp_ts_amount);
      }, 0);

      const percentage =
        totalAmount > 0 ? ((totalCategoryAmount / totalAmount) * 100).toFixed(2) : '0.00';

      return {
        category,
        totalAmount: totalCategoryAmount,
        transactionCount: transactions.length,
        percentage: parseFloat(percentage),
      };
    });
  };

  const totalIncome = incomeTransactions.reduce((sum, tx) => sum + Number(tx.exp_ts_amount), 0);
  const totalExpense = expenseTransactions.reduce((sum, tx) => sum + Number(tx.exp_ts_amount), 0);

  const incomeMetrics = calculateCategoryMetrics(incomeByCategory, totalIncome);
  const expenseMetrics = calculateCategoryMetrics(expenseByCategory, totalExpense);

  const data = activeTab === 'income' ? incomeMetrics : expenseMetrics;

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'income' && styles.activeTab]}
          onPress={() => setActiveTab('income')}>
          <Text style={[styles.tabText, activeTab === 'income' && styles.activeTabText]}>
            Income
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'expense' && styles.activeTab]}
          onPress={() => setActiveTab('expense')}>
          <Text style={[styles.tabText, activeTab === 'expense' && styles.activeTabText]}>
            Expense
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.category}
        renderItem={({ item, index }) => (
          <View>
            <View style={styles.card}>
              <View style={styles.left}>
                <View>
                  <View>
                    <Text style={styles.name}>{item.category}</Text>
                  </View>
                  <View style={styles.subTextContainer}>
                    <Text style={[styles.subText, { marginRight: 6, fontFamily: 'Inter-600' }]}>
                      {formatToCurrency(item.totalAmount)} <Text>{'\u2022'}</Text>
                    </Text>
                    <Text style={[styles.subText]}>
                      {item.transactionCount}{' '}
                      {item.transactionCount === 1 ? 'transaction' : 'transactions'}
                    </Text>
                  </View>
                </View>
              </View>

              <View>
                <Text style={styles.amount}>{item.percentage} %</Text>
              </View>
            </View>
            {index !== data.length - 1 && (
              <View
                style={{
                  borderBottomWidth: 0.5,
                  borderBottomColor: '#E2E2EA',
                  height: 1,
                  width: '100%',
                }}
              />
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderColor: '#E2E2EA',
    borderWidth: 0.5,
    margin: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#E2E2EA',
    borderRadius: 8,
    padding: 5,
  },
  tab: {
    flex: 1,
    padding: 5,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#6B5DE6',
    borderRadius: 8,
  },
  tabText: {
    color: '#282343',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  card: {
    padding: 8,
    // backgroundColor: '#141221',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E1E',
  },
  amount: {
    color: '#5A5A6E',
    fontSize: 14,
    fontFamily: 'Inter-500',
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  name: {
    color: '#1E1E1E',
    fontSize: 14,
    fontFamily: 'Inter-600',
  },
  subText: {
    color: '#7A7A8C',
    fontSize: 12,
    fontFamily: 'Inter-400',
  },
  subTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
});
