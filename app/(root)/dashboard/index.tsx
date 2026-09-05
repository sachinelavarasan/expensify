import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
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
import { Feather, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { format, parse } from 'date-fns';
import { useRouter } from 'expo-router';
import HomeSummaryCard from '@/components/HomeSummaryCard';
import HomeNudges from '@/components/HomeNudges';
import CalendarGrid from '@/components/CalendarGrid';
import CategorySelector from '@/components/CategorySelector';
import ModalCard from '@/components/ModalCard';
import Spacer from '@/components/Spacer';
import { useNetWorth } from '@/hooks/useNetWorth';
import { Itransaction } from '@/types';
import { useCategoryList } from '@/hooks/useCategoryListOperation';
import TransactionFilters from '@/components/TransactionsFilters';
import FilterChip from '@/components/FilterChip';
import { useGetUserData } from '@/hooks/useUserStore';
import { useGetSettingsFromStore } from '@/hooks/useGetSettingsValue';
import { useBankAccounts } from '@/hooks/useBankAccountOperation';
import { useThemeContext } from '@/contexts/ThemedContext';
import SwipeableRow from '@/components/Swippable';
import Checkbox from '@/components/Checkbox';
import { showToast } from '@/components/ToastMessage';
import {
  useBulkDeleteTransactions,
  useBulkStarTransactions,
  useBulkUpdateTransactions,
  useDeleteTransaction,
} from '@/hooks/useTransaction';
import GroupingModal from '@/components/GroupingModal';
import { getApiErrorMessage } from '@/lib/apiClient';
import { FontSize } from '@/utils/Typography';
import { useConfirm } from '@/hooks/useConfirm';

export default function Index() {
  const { colors } = useThemeContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirm, confirmModal } = useConfirm();
  const { accounts, loading: accountsLoading } = useBankAccounts();
  const { netWorth } = useNetWorth(accounts);
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
    currentDate,
    customDateRange,
    minAmount,
    maxAmount,
    categoryIds,
    tags,
    updateCustomDateRange,
    clearCustomDateRange,
    updateMinAmount,
    updateMaxAmount,
    updateCategoryIds,
    updateTags,
  } = useMonthlyTransactions(undefined, 'monthly', defaultAccountResolved);
  const { mutateAsync: deleteTransaction } = useDeleteTransaction();
  const { mutateAsync: bulkDeleteTransactions } = useBulkDeleteTransactions();
  const { mutateAsync: bulkUpdateTransactions } = useBulkUpdateTransactions();
  const { mutateAsync: bulkStarTransactions } = useBulkStarTransactions();
  const { categories } = useCategoryList();
  useGetUserData();
  const { value: showBalance } = useGetSettingsFromStore('balance');
  const { value: carryBalance } = useGetSettingsFromStore('over-balance');
  const { value: showNetWorth } = useGetSettingsFromStore('net-worth');

  const [refreshing, setRefreshing] = useState(false);
  const { value } = useGetSettingsFromStore('tt-time');

  // Bulk edit/delete selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState<string>('');

  // Calendar view state
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const hasAppliedDefaultAccount = useRef(false);
  useEffect(() => {
    if (hasAppliedDefaultAccount.current || accountsLoading) {
      return;
    }
    hasAppliedDefaultAccount.current = true;
    const primary = accounts.find((acc) => acc.exp_ba_is_primary);
    if (primary) {
      updateBankAccount([primary.exp_ba_id]);
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

  const handleDelete = async (exp_ts_id: string) => {
    try {
      const confirmed = await confirm({
        title: 'Delete this transaction?',
        message: 'Are you sure you want to delete this transaction?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        destructive: true,
      });

      if (!confirmed) return;

      if (exp_ts_id)
        deleteTransaction(exp_ts_id)
          .then(() => {
            showToast({
              text1: 'The transaction has been removed.',
              type: 'success',
              position: 'bottom',
            });
          })
          .catch((err) => {
            showToast({
              text1: getApiErrorMessage(err, 'Server Error'),
              type: 'error',
              position: 'bottom',
            });
          });
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const enterSelectionMode = (id: string) => {
    setSelectionMode(true);
    setSelectedIds((prev) => new Set(prev).add(id));
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    const confirmed = await confirm({
      title: `Delete ${count} transaction${count > 1 ? 's' : ''}?`,
      message: 'These will be moved to Trash.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await bulkDeleteTransactions(Array.from(selectedIds));
      showToast({ text1: 'Transactions moved to Trash', type: 'success', position: 'bottom' });
    } catch (err) {
      showToast({ text1: getApiErrorMessage(err, 'Server Error'), type: 'error', position: 'bottom' });
    } finally {
      exitSelectionMode();
    }
  };

  const handleBulkStar = async () => {
    try {
      await bulkStarTransactions(Array.from(selectedIds));
      showToast({ text1: 'Transactions starred', type: 'success', position: 'bottom' });
    } catch (err) {
      showToast({ text1: getApiErrorMessage(err, 'Server Error'), type: 'error', position: 'bottom' });
    } finally {
      exitSelectionMode();
    }
  };

  const handleBulkCategoryChange = async () => {
    if (!bulkCategoryId) return;
    try {
      await bulkUpdateTransactions({
        ids: Array.from(selectedIds),
        patch: { exp_tc_id: bulkCategoryId },
      });
      showToast({ text1: 'Category updated', type: 'success', position: 'bottom' });
    } catch (err) {
      showToast({ text1: getApiErrorMessage(err, 'Server Error'), type: 'error', position: 'bottom' });
    } finally {
      setCategoryModalVisible(false);
      setBulkCategoryId('');
      exitSelectionMode();
    }
  };

  const handleSelectDay = (dateStr: string) => {
    setSelectedDay(dateStr);
    setViewMode('list');
  };

  const applyFilters = (
    search: string,
    transactionType: string,
    selectedIds: (number | string)[],
    extras: {
      tags: string[];
      customDateRange: { start: string; end: string } | null;
      minAmount: string;
      maxAmount: string;
      categoryIds: string[];
    },
  ) => {
    updateSearch(search);
    updateTransactionType(transactionType);
    updateBankAccount(selectedIds);
    updateTags(extras.tags);
    if (extras.customDateRange) {
      updateCustomDateRange(extras.customDateRange);
    } else {
      clearCustomDateRange();
    }
    updateMinAmount(extras.minAmount);
    updateMaxAmount(extras.maxAmount);
    updateCategoryIds(extras.categoryIds);
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
        updateBankAccount([]);
        break;
      case 'dateRange':
        clearCustomDateRange();
        break;
      case 'amount':
        updateMinAmount('');
        updateMaxAmount('');
        break;
      case 'categories':
        updateCategoryIds([]);
        break;
      case 'tags':
        updateTags([]);
        break;
      case 'default':
        updateTransactionType('');
        updateSearch('');
        updateBankAccount([]);
        clearCustomDateRange();
        updateMinAmount('');
        updateMaxAmount('');
        updateCategoryIds([]);
        updateTags([]);
        break;
      default:
        break;
    }
  };

  const hasActiveFilters =
    !!search ||
    !!transactionType ||
    bankAccount.length > 0 ||
    !!customDateRange ||
    !!minAmount ||
    !!maxAmount ||
    categoryIds.length > 0 ||
    tags.length > 0;

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
    // Transfers move money between the user's own accounts, so they don't
    // count as income/expense, but they still change the balance of the
    // account(s) currently in view.
    transferNet: groupedData[date]
      .filter((item) => item.exp_tt_id === 3)
      .reduce(
        (sum, item) =>
          sum + (item.exp_ts_transfer_direction === 'out' ? -1 : 1) * Number(item.exp_ts_amount),
        0,
      ),
  }));
  const income = groupedDataArray.reduce((acc, item) => acc + item.credit, 0);
  const expense = groupedDataArray.reduce((acc, item) => acc + item.debit, 0);
  const transferNet = groupedDataArray.reduce((acc, item) => acc + item.transferNet, 0);

  const selectedTransactionTypes = useMemo(() => {
    const types = new Set<number>();
    transactions.forEach((item: Itransaction) => {
      if (selectedIds.has(item.exp_ts_id)) types.add(item.exp_tt_id);
    });
    return types;
  }, [transactions, selectedIds]);

  const bulkCategoryOptions = useMemo(() => {
    if (selectedTransactionTypes.size !== 1) return [];
    const [type] = selectedTransactionTypes;
    return categories.filter((category) => category.exp_tc_transaction_type === type);
  }, [categories, selectedTransactionTypes]);

  const displayedGroups = selectedDay
    ? groupedDataArray.filter((g) => g.date === selectedDay)
    : groupedDataArray;

  // The real value is always computed here - hiding it is purely a display
  // concern handled inside HomeSummaryCard (mask + peek toggle), not something
  // that should zero out the underlying number.
  const balance = useMemo(() => {
    if (!accounts || accounts.length === 0) return 0;
    if (carryBalance) return netWorth;
    return income - expense + transferNet;
  }, [accounts, carryBalance, income, expense, transferNet, netWorth]);

  return (
    <ThemedView style={{ flex: 1 }}>
      {(loading || !defaultAccountResolved) && <OverlayLoader />}
      {!selectionMode && (
        <TouchableOpacity
          style={[
            styles.floatingButton,
            { backgroundColor: colors.primary, shadowColor: colors.shadow },
          ]}
          onPress={handlePress}>
          <FontAwesome6 name="plus" size={22} color={colors.onPrimary} />
        </TouchableOpacity>
      )}
      <View style={{ backgroundColor: 'transparent', paddingBottom: 10 }}>
        <View
          style={{
            paddingVertical: 10,
            paddingHorizontal: 15,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            overflow: 'hidden',
          }}>
          <View
            style={{ flex: 1, minWidth: 0, opacity: customDateRange ? 0.4 : 1 }}
            pointerEvents={customDateRange ? 'none' : 'auto'}>
            <MonthSwitcher
              nextMonth={goToNext}
              prevMonth={goToPrevious}
              currentMonth={formattedTitle}
              currentDate={currentDate}
              dateRangeType={dateRangeType}
              onSelectDate={refetch}
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {selectionMode ? (
              <TouchableOpacity
                onPress={exitSelectionMode}
                style={[styles.iconTrigger, { backgroundColor: `${colors.primary}1A` }]}>
                <Ionicons name="close-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <>
                {!customDateRange && (
                  <TouchableOpacity
                    onPress={() => setViewMode('calendar')}
                    style={[styles.iconTrigger, { backgroundColor: `${colors.primary}1A` }]}>
                    <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  </TouchableOpacity>
                )}
                <GroupingModal grouping={dateRangeType} update={updateDateRangeType} tint />
                <TransactionFilters
                  applyFilters={applyFilters}
                  searchText={search}
                  selectedTransaction={transactionType}
                  selectedAccount={bankAccount}
                  accounts={accounts}
                  categories={categories}
                  selectedTags={tags}
                  selectedDateRange={customDateRange}
                  selectedMinAmount={minAmount}
                  selectedMaxAmount={maxAmount}
                  selectedCategoryIds={categoryIds}
                  hasActiveFilters={hasActiveFilters}
                />
              </>
            )}
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
            netWorth={netWorth}
            showNetWorth={showNetWorth}
          />
          <HomeNudges />
        </Animated.View>
        {(hasActiveFilters || !!selectedDay) && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingHorizontal: 15 }}
            style={{ marginVertical: 6 }}>
            <FilterChip
              label="Clear All"
              variant="solid"
              tone="danger"
              onRemove={() => {
                removeFilter('default');
                setSelectedDay(null);
              }}
            />
            {!!selectedDay && (
              <FilterChip
                label="Day"
                value={format(parse(selectedDay, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}
                variant="solid"
                onRemove={() => setSelectedDay(null)}
              />
            )}
            {!!search && (
              <FilterChip
                label="Search"
                value={search}
                variant="solid"
                onRemove={() => removeFilter('search')}
              />
            )}
            {!!transactionType && (
              <FilterChip
                label="Transaction type"
                value={transactionType}
                variant="solid"
                onRemove={() => removeFilter('t_type')}
              />
            )}
            {bankAccount.length > 0 && (
              <FilterChip
                label="Account"
                value={(() => {
                  const names = bankAccount
                    .map((id) => accounts?.find((item) => item.exp_ba_id == id)?.exp_ba_name)
                    .filter(Boolean) as string[];
                  if (names.length <= 2) return names.join(', ');
                  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
                })()}
                variant="solid"
                onRemove={() => removeFilter('account')}
              />
            )}
            {!!customDateRange && (
              <FilterChip
                label="Date range"
                value={`${format(parse(customDateRange.start, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')} - ${format(parse(customDateRange.end, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}`}
                variant="solid"
                onRemove={() => removeFilter('dateRange')}
              />
            )}
            {(!!minAmount || !!maxAmount) && (
              <FilterChip
                label="Amount"
                value={`${minAmount || '0'}-${maxAmount || '∞'}`}
                variant="solid"
                onRemove={() => removeFilter('amount')}
              />
            )}
            {categoryIds.length > 0 && (
              <FilterChip
                label="Categories"
                value={`${categoryIds.length}`}
                variant="solid"
                onRemove={() => removeFilter('categories')}
              />
            )}
            {tags.length > 0 && (
              <FilterChip
                label="Tags"
                value={`${tags.length}`}
                variant="solid"
                onRemove={() => removeFilter('tags')}
              />
            )}
          </ScrollView>
        )}
      </View>
      <ModalCard
        visible={viewMode === 'calendar'}
        onClose={() => setViewMode('list')}
        title="Calendar"
        presentation="sheet">
        <CalendarGrid
          groupedDataArray={groupedDataArray}
          currentDate={currentDate}
          onSelectDay={handleSelectDay}
          selectedDate={selectedDay ?? undefined}
        />
      </ModalCard>
      <FlatList
        bounces
        showsVerticalScrollIndicator={false}
        data={displayedGroups}
        extraData={[selectionMode, selectedIds]}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 250, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
                style={{ paddingVertical: 6, paddingHorizontal: 20 }}>
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

                {item.data.map((transaction: Itransaction) => {
                  const isSelected = selectedIds.has(transaction.exp_ts_id);
                  return (
                    <SwipeableRow
                      key={transaction.exp_ts_id}
                      disabled={selectionMode}
                      onDelete={() => handleDelete(transaction.exp_ts_id)}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {selectionMode && (
                          <View style={{ marginRight: 8 }}>
                            <Checkbox
                              checked={isSelected}
                              onPress={() => toggleSelect(transaction.exp_ts_id)}
                            />
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <TransactionCard
                            {...transaction}
                            showTsTime={value}
                            noRedirect={selectionMode}
                            onPress={
                              selectionMode
                                ? () => toggleSelect(transaction.exp_ts_id)
                                : undefined
                            }
                            onLongPress={() => enterSelectionMode(transaction.exp_ts_id)}
                          />
                        </View>
                      </View>
                    </SwipeableRow>
                  );
                })}
              </Animated.View>
            );
          }}
          keyExtractor={(item) => item.date}
        />

      {selectionMode && selectedIds.size > 0 && (
        <View
          style={[
            styles.bulkActionBar,
            { backgroundColor: colors.bottomBarBackground, borderColor: colors.inputBorder },
          ]}>
          <Text style={{ color: colors.title, fontFamily: 'Inter-600' }}>
            {selectedIds.size} selected
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={[styles.bulkActionButton, { backgroundColor: `${colors.favorite}1A` }]}
              onPress={handleBulkStar}>
              <MaterialIcons name="star-outline" size={19} color={colors.favorite} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bulkActionButton, { backgroundColor: `${colors.primary}1A` }]}
              onPress={() => {
                setBulkCategoryId('');
                setCategoryModalVisible(true);
              }}>
              <MaterialIcons name="label-outline" size={19} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bulkActionButton, { backgroundColor: `${colors.expense}1A` }]}
              onPress={handleBulkDelete}>
              <MaterialIcons name="delete-outline" size={19} color={colors.expense} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ModalCard
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        title="Change Category">
        {selectedTransactionTypes.size > 1 ? (
          <Text style={{ color: colors.description, fontFamily: 'Inter-500' }}>
            Select transactions of the same type (all income or all expense) to change their
            category.
          </Text>
        ) : (
          <>
            <CategorySelector
              categories={bulkCategoryOptions}
              selected={bulkCategoryId}
              onSelect={setBulkCategoryId}
            />
            <Spacer height={20} />
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={handleBulkCategoryChange}>
              <Text style={{ color: colors.onPrimary, fontFamily: 'Inter-600' }}>Apply</Text>
            </TouchableOpacity>
          </>
        )}
      </ModalCard>

      {confirmModal}
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
    right: 10,
    elevation: 2,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3.84,
    zIndex: 2,
  },
  iconTrigger: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulkActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  bulkActionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    paddingVertical: 10,
  },
});
