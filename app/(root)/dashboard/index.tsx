import { useState, useCallback } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Emptystate from '@/components/Emptystate';
import TransactionCard from '@/components/TransactionCard';
import MonthSwitcher from '@/components/MonthSwitch';
import OverlayLoader from '@/components/Overlay';
import { ThemedView } from '@/components/ThemedView';
import useMonthlyTransactions from '@/hooks/useTransactionsList';
import { formatToCurrency } from '@/utils/formatter';
import { Entypo, Feather, FontAwesome6 } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import HomeHeader from '../../../components/HomeHeader';
import { Itransaction } from '@/types';
import { useCategoryList } from '@/hooks/useCategoryListOperation';
import TransactionFilters from '@/components/TransactionsFilters';
import { useGetUserData } from '@/hooks/useUserStore';

export default function Index() {
  const router = useRouter();
  const {
    transactions,
    currentMonth,
    loading,
    goToPreviousMonth,
    goToNextMonth,
    refetch,
    updateSearch,
    updateTransactionType,
    search,
    transactionType,
  } = useMonthlyTransactions();
  useCategoryList();
  useGetUserData()

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      refetch();
      setRefreshing(false);
    }, 2000);
  }, []);

  const handlePress = () => {
    router.push('/(root)/transaction');
  };

  const applyFilters = (search: string, transactionType: string) => {
    updateSearch(search);
    updateTransactionType(transactionType);
  };
  const removeFilter = (type: string) => {
    switch (type) {
      case 'search':
        updateSearch('');
        break;
      case 't_type':
        updateTransactionType('');
        break;
      case 'default':
        updateTransactionType('');
        updateSearch('');
        break;
      default:
        break;
    }
  };

  const groupedData: { [index: string]: Itransaction[] } = transactions.reduce(
    (acc: { [index: string]: Itransaction[] }, item: Itransaction) => {
      const date = item.exp_ts_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    },
    {},
  );

  const groupedDataArray = Object.keys(groupedData).map((date) => ({
    date,
    data: groupedData[date],
    credit: groupedData[date]
      .filter((item) => item.exp_tt_id === 2)
      .reduce((sum, item) => sum + Number(item.exp_ts_amount), 0),
    debit: groupedData[date]
      .filter((item) => item.exp_tt_id === 1)
      .reduce((sum, item) => sum + Number(item.exp_ts_amount), 0),
  }));
  const income = groupedDataArray.reduce((acc, item) => acc + item.credit, 0);
  const expense = groupedDataArray.reduce((acc, item) => acc + item.debit, 0);

  return (
    <ThemedView style={{ flex: 1, paddingHorizontal: 10 }}>
      {loading && <OverlayLoader />}
      <TouchableOpacity style={styles.floatingButton} onPress={handlePress}>
        <Entypo name="plus" size={24} color="white" />
      </TouchableOpacity>
      <View>
        <FlatList
          bounces={false}
          showsVerticalScrollIndicator={false}
          data={groupedDataArray}
          contentContainerStyle={{ paddingBottom: 20, flex: 1 }}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={() => (
            <View style={{ backgroundColor: '#0F0E17', paddingBottom: 10 }}>
              <View
                style={{
                  paddingVertical: 10,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <MonthSwitcher
                  nextMonth={goToNextMonth}
                  prevMonth={goToPreviousMonth}
                  currentMonth={currentMonth}
                />
                <TransactionFilters
                  applyFilters={applyFilters}
                  searchText={search}
                  selectedTransaction={transactionType}
                />
              </View>
              <HomeHeader income={income} expense={expense} />
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                {!!search && (
                  <Pressable
                    style={{
                      borderWidth: 1,
                      borderColor: '#5a4f96',
                      paddingVertical: 4,
                      paddingHorizontal: 10,
                      borderRadius: 50,
                      flexDirection: 'row',
                      gap: 5,
                    }}
                    onPress={() => removeFilter('search')}>
                    <Text style={{ textTransform: 'capitalize' }}>{search}</Text>
                    <Entypo name="cross" size={18} color="#5a4f96" />
                  </Pressable>
                )}
                {!!transactionType && (
                  <Pressable
                    style={{
                      borderWidth: 1,
                      borderColor: '#5a4f96',
                      paddingVertical: 4,
                      paddingHorizontal: 10,
                      borderRadius: 50,
                      flexDirection: 'row',
                      gap: 5,
                    }}
                    onPress={() => removeFilter('t_type')}>
                    <Text style={{ textTransform: 'capitalize' }}>{transactionType}</Text>
                    <Entypo name="cross" size={18} color="#5a4f96" />
                  </Pressable>
                )}
                {!!search && !!transactionType && (
                  <Pressable
                    style={{
                      borderWidth: 1,
                      borderColor: '#5a4f96',
                      paddingVertical: 4,
                      paddingHorizontal: 10,
                      borderRadius: 50,
                      flexDirection: 'row',
                      gap: 5,
                    }}
                    onPress={() => removeFilter('default')}>
                    <Text style={{ textTransform: 'capitalize' }}>Clear All</Text>
                    <Entypo name="cross" size={18} color="#5a4f96" />
                  </Pressable>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Emptystate
              title="No transactions yet"
              description="Start by adding your income or expenses to see them here."
            />
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            return (
              <View style={{ paddingVertical: 10, paddingHorizontal: 5 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text style={styles.dateHeader}>
                    {format(new Date(item.date), 'dd MMMM yyyy')}
                  </Text>

                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {!!item.debit && (
                      <Text style={styles.totalAmount}>
                        <Feather name="arrow-up-right" size={12} color="#FF4D4F" />
                        {formatToCurrency(item.debit)}
                      </Text>
                    )}
                    {!!item.credit && (
                      <Text style={styles.totalAmount}>
                        <Feather name="arrow-down-left" size={12} color="#00C896" />
                        {formatToCurrency(item.credit)}
                      </Text>
                    )}
                  </View>
                </View>

                {item.data.map((lendItem: Itransaction) => (
                  <TransactionCard key={lendItem.exp_ts_id} {...lendItem} />
                ))}
              </View>
            );
          }}
          keyExtractor={(item) => item.date}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  month: {
    color: '#6900FF',
    fontSize: 17,
    fontFamily: 'Inter-700',
  },
  monthSwitch: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    color: '#1C1C29',
    fontSize: 16,
    fontFamily: 'Inter-600',
  },
  totalAmount: {
    color: '#D5D5D5',
    fontSize: 14,
    fontFamily: 'Inter-500',
  },
  dateHeader: {
    fontSize: 12,
    fontFamily: 'Inter-500',
    color: '#a19bca',
  },
  floatingButton: {
    backgroundColor: '#5a4f96', // Replace with your primary color
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    right: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 2,
    marginRight: 10,
  },
});
