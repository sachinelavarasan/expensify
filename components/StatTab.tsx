import { Itransaction } from '@/types';
import { formatToCurrency } from '@/utils/formatter';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Spacer from './Spacer';


interface progressBar {
    category: string;
    color: string;
    totalAmount: number;
    transactionCount: number;
    percentage: number;
}

type SegmentProps = {
  color: string;
  percentage: number;
  progress: any; // sharedValue passed down
};

function ProgressSegment({ color, percentage, progress }: SegmentProps) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      flex: percentage * progress.value,
    };
  });

  return <Animated.View style={[styles.segment, { backgroundColor: color }, animatedStyle]} />;
}

function MultiColorProgressBar({ data }: { data: progressBar[] }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 1500 });
  }, [progress]);

  return (
    <View style={styles.container}>
      <Text style={{
        fontFamily:'Inter-600',
        fontSize: 14,
        color: "#FFF"
      }}>Spending by Category</Text>
      <Spacer height={10}/>
      <View style={styles.barBackground}>
        {data.map((cat, index) => (
          <ProgressSegment
            key={index}
            color={cat.color}
            percentage={cat.percentage}
            progress={progress}
          />
        ))}
      </View>

      <View style={styles.legend}>
        {data.map((cat, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: cat.color }]} />
            <Text style={styles.legendText}>
              {cat.category} - {cat.percentage}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ProgressBar({ percentage }: { percentage: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(percentage, { duration: 800 });
  }, [percentage, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View
      style={{
        height: 6,
        backgroundColor: '#ccc',
        borderRadius: 4,
        overflow: 'hidden',
        marginTop: 6,
        width: 50,
      }}>
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: '#6C63FF',
            borderRadius: 4,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

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
        color: transactions[0]?.exp_tc_icon_bg_color,
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

      <MultiColorProgressBar data={data}/>

      <FlatList
        data={data}
        keyExtractor={(item) => item.category}
        renderItem={({ item }) => (
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
              <ProgressBar percentage={item.percentage} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0911',
    padding: 12,
    borderRadius: 8,
    borderColor: '#1e1a32',
    borderWidth: 1,
    margin: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#1e1a32',
    borderRadius: 8,
    padding: 5,
  },
  tab: {
    flex: 1,
    padding: 5,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#463e75',
    borderRadius: 8,
  },
  tabText: {
    color: '#B3B1C4',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  card: {
    padding: 8,
    marginBottom: 12,
    // backgroundColor: '#141221',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  amount: {
    color: '#B0AEC0',
    fontSize: 12,
    fontFamily: 'Inter-400',
    textAlign: 'center',
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-600',
  },
  subText: {
    color: '#8880A0',
    fontSize: 12,
    fontFamily: 'Inter-400',
  },
  subTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  barBackground: {
    flexDirection: "row",
    height: 24,
    width: "100%",
    backgroundColor: "#1e1a32",
    borderRadius: 12,
    overflow: "hidden",
  },
  segment: {
    height: "100%",
    borderRadius: 0, // rounded is handled by container
  },
  legend: {
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  colorBox: {
    width: 14,
    height: 14,
    marginRight: 8,
    borderRadius: 3,
  },
  legendText: {
    color: "#ccc",
    fontSize: 12,
  },
});
