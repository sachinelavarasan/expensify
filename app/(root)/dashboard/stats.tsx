import { ThemedView } from '@/components/ThemedView';
import { View, Text, FlatList } from 'react-native';
import { PieChart, pieDataItem } from 'react-native-gifted-charts';
import useMonthlyTransactions from '@/hooks/useTransactionsList';
import MonthSwitcher from '@/components/MonthSwitch';
import OverlayLoader from '@/components/Overlay';
import TableView from '@/components/Table';
import IncomeExpenseTabs from '@/components/StatTab';
import { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native-gesture-handler';

export default function Stat() {
  const { transactions, currentMonth, loading, goToNextMonth, goToPreviousMonth, refetch } =
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
      color: !divident ? '#00C896' : '#3A3A50',
      text: `Income: ${((totalIncome / (divident ? 1 : total)) * 100).toFixed(0)}%`,
    },
    {
      value: divident ? 1 : totalExpense,
      color: !divident ? '#FF4D4F' : '#3A3A50',
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

  return (
    <ThemedView style={{ flex: 1, paddingHorizontal: 10 }}>
      {loading && <OverlayLoader />}

      <FlatList
        data={[1]} // dummy data to trigger render
        keyExtractor={() => 'page-wrapper'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
        renderItem={null as any}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            <View style={{ paddingVertical: 10 }}>
              <MonthSwitcher
                nextMonth={goToNextMonth}
                prevMonth={goToPreviousMonth}
                currentMonth={currentMonth}
              />
            </View>

            <View
              style={{
                paddingVertical: 10,
                alignItems: 'center',
              }}>
              <PieChart
                data={pieData}
                radius={100}
                donut
                isAnimated
                animationDuration={500}
                innerCircleColor="#1F1A29"
                innerRadius={80}
                labelsPosition="mid"
                textColor="#6900FF"
                centerLabelComponent={() =>
                  pieData.length > 0 ? (
                    pieData.map((item, index) => (
                      <Text
                        key={index}
                        style={{
                          fontSize: 14,
                          marginBottom: 5,
                          color: item.color,
                          fontFamily: 'Inter-600',
                        }}>
                        {item.text}
                      </Text>
                    ))
                  ) : (
                    <Text style={{ fontSize: 16, color: '#333' }}>No data</Text>
                  )
                }
              />
            </View>

            <View style={{flex: 1}}>
              <TableView transactions={transactions} />
            </View>

            {transactions.length > 0 && (
              <View>
                <IncomeExpenseTabs transactions={transactions} />
              </View>
            )}
          </>
        }
      />
    </ThemedView>
  );
}
