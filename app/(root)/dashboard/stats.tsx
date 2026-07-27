import { ThemedView } from '@/components/ThemedView';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { PieChart, pieDataItem } from 'react-native-gifted-charts';
import useMonthlyTransactions from '@/hooks/useTransactionsList';
import MonthSwitcher from '@/components/MonthSwitch';
import OverlayLoader from '@/components/Overlay';
import TableView from '@/components/Table';
import IncomeExpenseTabs from '@/components/StatTab';
import Emptystate from '@/components/Emptystate';
import { useCallback, useEffect, useState } from 'react';
import { useThemeContext } from '@/contexts/ThemedContext';
import GroupingModal from '@/components/GroupingModal';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { FontSize, Typography } from '@/utils/Typography';

export default function Stat() {
  const { colors } = useThemeContext();
  const { transactions, formattedTitle, loading, goToNext, goToPrevious, refetch, dateRangeType, updateDateRangeType } =
    useMonthlyTransactions();

  const [refreshing, setRefreshing] = useState(false);

  const incomeTransactions = transactions.filter((tx) => tx.exp_tt_id === 2);

  const expenseTransactions = transactions.filter((tx) => tx.exp_tt_id === 1);

  const totalIncome = incomeTransactions.reduce((sum, tx) => sum + Number(tx.exp_ts_amount), 0);

  const totalExpense = expenseTransactions.reduce((sum, tx) => sum + Number(tx.exp_ts_amount), 0);

  const total = totalIncome + totalExpense;
  const divident = totalIncome === 0 && totalExpense === 0;

  const pieData: pieDataItem[] = [
    {
      value: divident ? 1 : totalIncome,
      color: !divident ? colors.income : colors.arrowColor,
      text: `Income: ${((totalIncome / (divident ? 1 : total)) * 100).toFixed(0)}%`,
    },
    {
      value: divident ? 1 : totalExpense,
      color: !divident ? colors.expense : colors.arrowColor,
      text: `Expense: ${((totalExpense / (divident ? 1 : total)) * 100).toFixed(0)}%`,
    },
  ];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      refetch();
      setRefreshing(false);
    }, 2000);
  }, []);

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
        bounces={false}
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
              <GroupingModal grouping={dateRangeType} update={updateDateRangeType}/>
            </View>

            <Animated.View
              style={[
                {
                  paddingVertical: 10,
                  alignItems: 'center',
                },
                chartAnimatedStyle,
              ]}>
              <PieChart
                data={pieData}
                radius={100}
                donut
                isAnimated
                animationDuration={500}
                innerCircleColor={colors.barBackground}
                innerRadius={65}
                labelsPosition="mid"
                textColor={colors.primary}
                centerLabelComponent={() =>
                  pieData.length > 0 ? (
                    pieData.map((item, index) => (
                      <Text
                        key={index}
                        style={{
                          ...Typography.bodySemiBold,
                          marginBottom: 5,
                          color: item.color,
                        }}>
                        {item.text}
                      </Text>
                    ))
                  ) : (
                    <Text style={{ fontSize: FontSize.md, color: colors.title, fontFamily: 'Inter-500' }}>No data</Text>
                  )
                }
              />
            </Animated.View>

            {/* <View> */}
              <TableView transactions={transactions} />
            {/* </View> */}

            {transactions.length > 0 ? (
              <View>
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
