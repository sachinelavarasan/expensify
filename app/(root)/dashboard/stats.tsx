import { ThemedView } from '@/components/ThemedView';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import useMonthlyTransactions from '@/hooks/useTransactionsList';
import MonthSwitcher from '@/components/MonthSwitch';
import OverlayLoader from '@/components/Overlay';
import IncomeExpenseTabs from '@/components/StatTab';
import Emptystate from '@/components/Emptystate';
import { useCallback, useEffect, useState } from 'react';
import { useThemeContext } from '@/contexts/ThemedContext';
import GroupingModal from '@/components/GroupingModal';
import SpendTrendChart from '@/components/SpendTrendChart';
import StatsSummaryCard from '@/components/StatsSummaryCard';
import BreakdownChart from '@/components/BreakdownChart';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { FontSize } from '@/utils/Typography';

export default function Stat() {
  const { colors } = useThemeContext();
  const queryClient = useQueryClient();
  const { transactions, formattedTitle, loading, goToNext, goToPrevious, refetch, dateRangeType, updateDateRangeType } =
    useMonthlyTransactions();

  const [refreshing, setRefreshing] = useState(false);

  const incomeTransactions = transactions.filter((tx) => tx.exp_tt_id === 2);

  const expenseTransactions = transactions.filter((tx) => tx.exp_tt_id === 1);

  const totalIncome = incomeTransactions.reduce((sum, tx) => sum + Number(tx.exp_ts_amount), 0);

  const totalExpense = expenseTransactions.reduce((sum, tx) => sum + Number(tx.exp_ts_amount), 0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['spend-trend'] });
      setRefreshing(false);
    }, 2000);
  }, [refetch, queryClient]);

  useFocusEffect(
    useCallback(() => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['spend-trend'] });
    }, [refetch, queryClient]),
  );

  const chartOpacity = useSharedValue(0);

  useEffect(() => {
    if (!loading) {
      chartOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [loading]);

  const chartAnimatedStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
  }));

  return (
    <ThemedView style={{ flex: 1, paddingHorizontal: 15 }}>
      {loading && <OverlayLoader />}

      <FlatList
        data={[1]}
        bounces
        alwaysBounceVertical
        keyExtractor={() => 'page-wrapper'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
        renderItem={null as any}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            <View style={{ paddingVertical: 10, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
              <MonthSwitcher
                nextMonth={goToNext}
                prevMonth={goToPrevious}
                currentMonth={formattedTitle}
              />
              <View style={{ flexShrink: 0 }}>
                <GroupingModal grouping={dateRangeType} update={updateDateRangeType}/>
              </View>
            </View>

            <Animated.View style={chartAnimatedStyle}>
              <StatsSummaryCard
                income={totalIncome}
                expense={totalExpense}
                transactionCount={transactions.length}
              />

              <Text style={[styles.sectionHeader, { color: colors.lighterTitle }]}>Trend</Text>
              <SpendTrendChart />

              <Text style={[styles.sectionHeader, { color: colors.lighterTitle }]}>Breakdown</Text>
              <BreakdownChart income={totalIncome} expense={totalExpense} />
            </Animated.View>

            {transactions.length > 0 ? (
              <View>
                <Text style={[styles.sectionHeader, { color: colors.lighterTitle }]}>By Category</Text>
                <IncomeExpenseTabs transactions={transactions} />
              </View>
            ) : (
              !loading && (
                <Emptystate
                  title="No transactions yet"
                  description="Add income or expenses for this period to see your stats here."
                />
              )
            )}
          </>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-500',
    marginTop: 20,
    marginBottom: 4,
  },
});
