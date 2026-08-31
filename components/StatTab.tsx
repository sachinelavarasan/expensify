import { Itransaction } from '@/types';
import { formatToCurrency } from '@/utils/formatter';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { PieChart, pieDataItem } from 'react-native-gifted-charts';

import { useThemeContext } from '@/contexts/ThemedContext';
import SegmentedControl from './SegmentedControl';
import { FontSize } from '@/utils/Typography';
import { Spacing } from '@/utils/Spacing';

interface progressBar {
  category: string;
  color: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

function CategoryDonut({
  data,
  total,
  emptyLabel,
}: {
  data: progressBar[];
  total: number;
  emptyLabel: string;
}) {
  const { colors } = useThemeContext();

  if (!data || data.length === 0) {
    return <Text style={[styles.subText, { color: colors.description }]}>{emptyLabel}</Text>;
  }

  const pieData: pieDataItem[] = data.map((cat) => ({
    value: cat.totalAmount,
    color: cat.color || colors.categoryFallbackIcon,
  }));

  return (
    <View
      style={[
        styles.donutSection,
        { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
      ]}>
      <View style={styles.donutWrap}>
        <PieChart
          data={pieData}
          radius={72}
          donut
          isAnimated
          animationDuration={500}
          innerCircleColor={colors.cardBg}
          innerRadius={50}
          centerLabelComponent={() => (
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.centerLabel, { color: colors.description }]}>Total</Text>
              <Text style={[styles.centerValue, { color: colors.title }]} numberOfLines={1}>
                {formatToCurrency(total)}
              </Text>
            </View>
          )}
        />
      </View>

      <View style={styles.donutLegend}>
        {data.map((cat, i) => (
          <View key={i} style={styles.donutLegendItem}>
            <View style={[styles.colorBox, { backgroundColor: cat.color }]} />
            <Text style={[styles.legendText, { color: colors.description }]}>
              <Text style={{ fontFamily: 'Inter-600', color: colors.title }}>{cat.category}</Text>{' '}
              {cat.percentage}%
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
        { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
      ]}>
      <View style={{ marginBottom: Spacing.lg }}>
        <SegmentedControl
          options={[
            { id: 'income', label: 'Income', count: incomeTransactions.length },
            { id: 'expense', label: 'Expense', count: expenseTransactions.length },
          ]}
          value={activeTab}
          onChange={(id) => setActiveTab(id as 'income' | 'expense')}
        />
      </View>

      <CategoryDonut
        data={data}
        total={activeTab === 'income' ? totalIncome : totalExpense}
        emptyLabel={`No ${activeTab} transaction added yet`}
      />

      <FlatList
        data={data}
        keyExtractor={(item) => item.category}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
            ]}>
            <View style={[styles.dot, { backgroundColor: item.color || colors.categoryFallbackIcon }]} />
            <View style={styles.left}>
              <Text style={[styles.name, { color: colors.title }]}>{item.category}</Text>
              <Text style={[styles.subText, { color: colors.description }]}>
                {formatToCurrency(item.totalAmount)} {'\u00b7'} {item.transactionCount}{' '}
                {item.transactionCount === 1 ? 'txn' : 'txns'}
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.amount, { color: colors.title }]}>{item.percentage}%</Text>
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
  card: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  amount: {
    fontSize: FontSize.md,
    fontFamily: 'Inter-700',
  },
  left: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-700',
  },
  subText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    marginTop: 2,
  },
  donutSection: {
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  donutWrap: {
    marginBottom: Spacing.md,
  },
  centerLabel: {
    fontSize: 10,
    fontFamily: 'Inter-500',
  },
  centerValue: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    marginTop: 1,
  },
  donutLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  donutLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorBox: {
    width: 10,
    height: 10,
    marginRight: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
    // color applied inline via colors.description at usage site
  },
});
