import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Alert,
  ColorValue,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useQueryClient } from '@tanstack/react-query';

import Emptystate from '@/components/Emptystate';
import TransactionCard from '@/components/TransactionCard';
import MonthSwitcher from '@/components/MonthSwitch';
import OverlayLoader from '@/components/Overlay';
import { ThemedView } from '@/components/ThemedView';
import useMonthlyTransactions from '@/hooks/useTransactionsList';
import { formatToCurrency } from '@/utils/formatter';
import { Feather, FontAwesome6 } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import HomeSummaryCard from '@/components/HomeSummaryCard';
import HomeNudges from '@/components/HomeNudges';
import { Itransaction } from '@/types';
import { useCategoryList } from '@/hooks/useCategoryListOperation';
import TransactionFilters from '@/components/TransactionsFilters';
import FilterChip from '@/components/FilterChip';
import { useGetUserData } from '@/hooks/useUserStore';
import { useGetSettingsFromStore } from '@/hooks/useGetSettingsValue';
import { useBankAccounts } from '@/hooks/useBankAccountOperation';
import { useThemeContext } from '@/contexts/ThemedContext';
import { LinearGradient } from 'expo-linear-gradient';
import SwipeableRow from '@/components/Swippable';
import { showToast } from '@/components/ToastMessage';
import { useDeleteTransaction } from '@/hooks/useTransaction';
import GroupingModal from '@/components/GroupingModal';
import { FontSize } from '@/utils/Typography';

export default function Index() {
  const { colors } = useThemeContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accounts, loading: accountsLoading } = useBankAccounts();
  const [defaultAccountResolved, setDefaultAccountResolved] = useState(false);
  const {
    transactions,
    formattedTitle,
    loading,
    goToPrevious,
    goToNext,
    refetch,
    updateSearch,
    updateTransactionType,
    search,
    transactionType,
    dateRangeType,
    bankAccount,
    updateBankAccount,
    updateDateRangeType,
  } = useMonthlyTransactions(undefined, 'monthly', defaultAccountResolved);
  const { mutateAsync: deleteTransaction } = useDeleteTransaction();
  useCategoryList();
  useGetUserData();
  const [balance, setBalance] = useState<number>(0);
  const { value: showBalance } = useGetSettingsFromStore('balance');
  const { value: carryBalance } = useGetSettingsFromStore('over-balance');

  const [refreshing, setRefreshing] = useState(false);
  const { value } = useGetSettingsFromStore('tt-time');

  const hasAppliedDefaultAccount = useRef(false);
  useEffect(() => {
    if (hasAppliedDefaultAccount.current || accountsLoading) {
      return;
    }
    hasAppliedDefaultAccount.current = true;
    const primary = accounts.find((acc) => acc.exp_ba_is_primary);
    if (primary) {
      updateBankAccount(primary.exp_ba_id);
    }
    setDefaultAccountResolved(true);
  }, [accounts, accountsLoading, updateBankAccount]);

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(12);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 350 });
    headerTranslateY.value = withTiming(0, { duration: 350 });
  }, [headerOpacity, headerTranslateY]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['spend-trend'] });
      setRefreshing(false);
    }, 2000);
  }, [refetch, queryClient]);

  const handlePress = () => {
    router.push('/(root)/transaction');
  };

  const handleDelete = async (exp_ts_id: number) => {
    try {
      const confirm = await new Promise((resolve) =>
        Alert.alert(
          'Delete this transaction?',
          'Are you sure you want to delete this transaction?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
          ],
        ),
      );

      if (!confirm) return;

      if (exp_ts_id)
        deleteTransaction(Number(exp_ts_id))
          .then(() => {
            showToast({
              text1: 'The transaction has been removed.',
              type: 'success',
              position: 'bottom',
            });
          })
          .catch(() => {
            showToast({
              text1: 'Server Error',
              type: 'error',
              position: 'bottom',
            });
          });
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const applyFilters = (search: string, transactionType: string, selectedId: number | string) => {
    updateSearch(search);
    updateTransactionType(transactionType);
    updateBankAccount(selectedId);
  };
  const removeFilter = (type: string) => {
    switch (type) {
      case 'search':
        updateSearch('');
        break;
      case 't_type':
        updateTransactionType('');
        break;
      case 'account':
        updateBankAccount('');
        break;
      case 'default':
        updateTransactionType('');
        updateSearch('');
        updateBankAccount('');
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

  useEffect(() => {
    if (!accounts || accounts.length === 0) {
      setBalance(0);
      return;
    }
    if (carryBalance) {
      const totalBalance = accounts
        .filter((acc) => acc.exp_ba_is_active && !acc.exp_ba_is_deleted)
        .reduce((sum, acc) => sum + (parseFloat(acc.exp_ba_balance) || 0), 0);

      setBalance(totalBalance);
    } else if (!showBalance) {
      setBalance(income - expense);
    } else {
      setBalance(0);
    }
  }, [carryBalance, showBalance, accounts, income, expense]);

  return (
    <ThemedView style={{ flex: 1 }}>
      {(loading || !defaultAccountResolved) && <OverlayLoader />}
      <TouchableOpacity
        style={{
          width: 30,
          height: 30,
          position: 'absolute',
          bottom: 20,
          right: 0,
          zIndex: 2,
          marginRight: 10,
        }}
        onPress={handlePress}>
        <LinearGradient
          colors={colors.floatingBtnBg as [ColorValue, ColorValue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.floatingButton, { shadowColor: colors.shadow }]}>
          <FontAwesome6 name="plus" size={22} color={colors.onPrimary} />
        </LinearGradient>
      </TouchableOpacity>
      <FlatList
        bounces
        alwaysBounceVertical
        showsVerticalScrollIndicator={false}
        data={groupedDataArray}
        contentContainerStyle={{ paddingBottom: 250, flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={{ backgroundColor: 'transparent', paddingBottom: 10 }}>
            <View
              style={{
                paddingVertical: 10,
                paddingHorizontal: 15,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                overflow: 'hidden',
              }}>
              <MonthSwitcher
                nextMonth={goToNext}
                prevMonth={goToPrevious}
                currentMonth={formattedTitle}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <GroupingModal grouping={dateRangeType} update={updateDateRangeType} />
                <TransactionFilters
                  applyFilters={applyFilters}
                  searchText={search}
                  selectedTransaction={transactionType}
                  selectedAccount={bankAccount}
                  accounts={accounts}
                  hasActiveFilters={!!search || !!transactionType || !!bankAccount}
                />
              </View>
            </View>
            <Animated.View style={[{ paddingHorizontal: 15 }, headerAnimatedStyle]}>
              <HomeSummaryCard
                income={income}
                expense={expense}
                carryBalance={carryBalance}
                showBalance={showBalance}
                balance={balance}
                transactions={transactions}
              />
              <HomeNudges />
            </Animated.View>
            {(!!search || !!transactionType || !!bankAccount) && (
              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  flexWrap: 'wrap',
                  marginVertical: 6,
                  paddingHorizontal: 15,
                }}>
                {!!search && (
                  <FilterChip label="Search" value={search} onRemove={() => removeFilter('search')} />
                )}
                {!!transactionType && (
                  <FilterChip
                    label="Transaction type"
                    value={transactionType}
                    onRemove={() => removeFilter('t_type')}
                  />
                )}
                {!!bankAccount && (
                  <FilterChip
                    label="Account"
                    value={accounts?.find((item) => item.exp_ba_id == bankAccount)?.exp_ba_name}
                    onRemove={() => removeFilter('account')}
                  />
                )}
                <FilterChip label="Clear Filters" onRemove={() => removeFilter('default')} />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <Emptystate
            title="No transactions yet"
            description="Start by adding your income or expenses to see them here."
          />
        }
        renderItem={({ item, index }) => {
          return (
            <Animated.View
              entering={FadeInDown.duration(300).delay(Math.min(index, 6) * 40)}
              style={{ paddingVertical: 10, paddingHorizontal: 20 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text style={[styles.dateHeader, { color: colors.lighterTitle }]}>
                  {format(new Date(item.date), 'dd MMMM yyyy')}
                </Text>

                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {!!item.debit && (
                    <Text style={[styles.totalAmount, { color: colors.title }]}>
                      <Feather name="arrow-up-right" size={12} color={colors.expense} />
                      {formatToCurrency(item.debit)}
                    </Text>
                  )}
                  {!!item.credit && (
                    <Text style={[styles.totalAmount, { color: colors.title }]}>
                      <Feather name="arrow-down-left" size={12} color={colors.income} />
                      {formatToCurrency(item.credit)}
                    </Text>
                  )}
                </View>
              </View>

              {item.data.map((transaction: Itransaction) => (
                <SwipeableRow
                  key={transaction.exp_ts_id}
                  onDelete={() => handleDelete(transaction.exp_ts_id)}>
                  <TransactionCard {...transaction} showTsTime={value} />
                </SwipeableRow>
              ))}
            </Animated.View>
          );
        }}
        keyExtractor={(item) => item.date}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  monthSwitch: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalAmount: {
    // color intentionally omitted: always overridden inline with a theme color (colors.title)
    fontSize: FontSize.base,
    fontFamily: 'Inter-500',
  },
  dateHeader: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    // color intentionally omitted: always overridden inline with a theme color (colors.lighterTitle)
  },
  floatingButton: {
    width: 45,
    height: 45,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    right: 0,
    elevation: 2,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3.84,
    zIndex: 2,
    marginRight: 10,
  },
});
