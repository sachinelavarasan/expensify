import { Itransaction } from '@/types';
import { formatToCurrency } from '@/utils/formatter';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { useThemeContext } from '@/contexts/ThemedContext';
import Spacer from './Spacer';
import { FontSize } from '@/utils/Typography';
import { Spacing } from '@/utils/Spacing';

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
  const { colors } = useThemeContext();

  useEffect(() => {
    progress.value = withTiming(1, { duration: 1500 });
  }, [progress]);

  if(!data || data.length === 0){
    return <Text style={[styles.subText, { color: colors.description }]}>No income transaction added yet</Text>
  }

  return (
    <View
      style={{
        padding: 10,
        // backgroundColor: colors.bottomBarBackground,
        borderWidth: 1,
        // borderColor: colors.borderColor,
        borderRadius: 6,
        marginBottom: 10,
        backgroundColor: colors.inputColor, 
        borderColor: colors.inputBorder
      }}>
      <Text
        style={{
          fontFamily: 'Inter-600',
          fontSize: FontSize.base,
          color: colors.title,
        }}>
        Spending by Category
      </Text>
      <Spacer height={10} />
      <View style={[styles.barBackground, { backgroundColor: colors.barBackground }]}>
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
            <Text style={[styles.legendText, { color: colors.description }]}>
              {cat.category} - {cat.percentage}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ProgressBar({ percentage, color }: { percentage: number; color: string }) {
  const progress = useSharedValue(0);
  const { colors } = useThemeContext();

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
        backgroundColor: colors.barBackground,
        borderRadius: 4,
        overflow: 'hidden',
        marginTop: 6,
        width: 50,
      }}>
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: color || colors.primary,
            borderRadius: 4,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

export default function IncomeExpenseTabs({ transactions }: { transactions: Itransaction[] }) {
  const { colors } = useThemeContext();
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
    <View
      style={[
        styles.container,
        { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
      ]}>
      <View style={[styles.tabContainer, { backgroundColor: colors.barBackground }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'income' && { ...styles.activeTab, backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('income')}>
          <Text
            style={[
              styles.tabText,
              { color: colors.description },
              activeTab === 'income' && [styles.activeTabText, { color: colors.onPrimary }],
            ]}>
            Income
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'expense' && { ...styles.activeTab, backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('expense')}>
          <Text
            style={[
              styles.tabText,
              { color: colors.description },
              activeTab === 'expense' && [styles.activeTabText, { color: colors.onPrimary }],
            ]}>
            Expense
          </Text>
        </TouchableOpacity>
      </View>

      <MultiColorProgressBar data={data} />

      <FlatList
        data={data}
        keyExtractor={(item) => item.category}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.left}>
              <View>
                <View>
                  <Text style={[styles.name, { color: colors.title }]}>{item.category}</Text>
                </View>
                <View style={styles.subTextContainer}>
                  <Text
                    style={[
                      styles.subText,
                      { marginRight: 6, fontFamily: 'Inter-600', color: colors.description },
                    ]}>
                    {formatToCurrency(item.totalAmount)} <Text>{'\u2022'}</Text>
                  </Text>
                  <Text style={[styles.subText, { color: colors.description }]}>
                    {item.transactionCount}{' '}
                    {item.transactionCount === 1 ? 'transaction' : 'transactions'}
                  </Text>
                </View>
              </View>
            </View>

            <View>
              <Text style={[styles.amount, { color: colors.description }]}>
                {item.percentage} %
              </Text>
              <ProgressBar percentage={item.percentage} color={item.color} />
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
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: Spacing.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    borderRadius: 8,
    padding: 5,
  },
  tab: {
    flex: 1,
    padding: 5,
    alignItems: 'center',
  },
  activeTab: {
    borderRadius: 8,
  },
  tabText: {
    fontFamily: 'Inter-500',
  },
  activeTabText: {
    // color applied inline via colors.onPrimary at usage site (active tab pill uses colors.primary)
  },
  card: {
    padding: Spacing.sm,
    marginBottom: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.md,
    fontFamily: 'Inter-600',
  },
  amount: {
    fontSize: FontSize.sm,
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
    fontSize: FontSize.base,
    fontFamily: 'Inter-600',
  },
  subText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
  },
  subTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  barBackground: {
    flexDirection: 'row',
    height: 20,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    // backgroundColor applied inline via colors.barBackground at usage site
  },
  segment: {
    height: '100%',
    borderRadius: 0,
  },
  legend: {
    marginTop: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  colorBox: {
    width: 14,
    height: 14,
    marginRight: Spacing.sm,
    borderRadius: 3,
  },
  legendText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
    // color applied inline via colors.description at usage site
  },
});
