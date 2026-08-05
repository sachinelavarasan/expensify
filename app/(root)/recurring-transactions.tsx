import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import ProfileHeader from '@/components/ProfileHeader';
import Emptystate from '@/components/Emptystate';
import OverlayLoader from '@/components/Overlay';
import SwipeableRow from '@/components/Swippable';
import RecurringTransactionCard from '@/components/RecurringTransactionCard';
import RecurringSummaryCard from '@/components/RecurringSummaryCard';
import {
  useDeleteRecurringTransaction,
  useRecurringTransactions,
  useUpdateRecurringTransaction,
} from '@/hooks/useRecurringTransaction';
import { useThemeContext } from '@/contexts/ThemedContext';
import { showToast } from '@/components/ToastMessage';
import { getApiErrorMessage } from '@/lib/apiClient';
import { IRecurringTransaction } from '@/types';
import { RECURRING_DUE_SOON_DAYS, getDaysUntilDue, toMonthlyAmount } from '@/utils/recurringAlerts';
import { FontSize } from '@/utils/Typography';

export default function RecurringTransactions() {
  const { colors } = useThemeContext();
  const router = useRouter();
  const { recurringTransactions, loading, refetch } = useRecurringTransactions();
  const { mutateAsync: deleteRecurringTransaction } = useDeleteRecurringTransaction();
  const { mutateAsync: updateRecurringTransaction } = useUpdateRecurringTransaction();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const handleDelete = (id: string) => {
    deleteRecurringTransaction(id).catch((err) => {
      showToast({
        text1: getApiErrorMessage(err, 'Failed to delete recurring transaction'),
        type: 'error',
        position: 'bottom',
      });
    });
  };

  const handleToggleActive = (id: string, value: boolean) => {
    updateRecurringTransaction({ exp_rt_id: id, exp_rt_is_active: value }).catch((err) => {
      showToast({
        text1: getApiErrorMessage(err, 'Failed to update recurring transaction'),
        type: 'error',
        position: 'bottom',
      });
    });
  };

  const { dueSoon, upcoming, paused, monthlyOutflow, monthlyIncome, next } = useMemo(() => {
    const active = recurringTransactions.filter((item) => item.exp_rt_is_active);
    const pausedItems = recurringTransactions.filter((item) => !item.exp_rt_is_active);

    const withDays = active.map((item) => ({
      item,
      daysUntil: getDaysUntilDue(item.exp_rt_next_due_date),
    }));
    const dueSoonItems = withDays
      .filter(({ daysUntil }) => daysUntil <= RECURRING_DUE_SOON_DAYS)
      .sort((a, b) => a.daysUntil - b.daysUntil);
    const upcomingItems = withDays
      .filter(({ daysUntil }) => daysUntil > RECURRING_DUE_SOON_DAYS)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    const outflow = active
      .filter((item) => item.exp_rt_transaction_type_id !== 2)
      .reduce((sum, item) => sum + toMonthlyAmount(Number(item.exp_rt_amount), item.exp_rt_frequency), 0);
    const income = active
      .filter((item) => item.exp_rt_transaction_type_id === 2)
      .reduce((sum, item) => sum + toMonthlyAmount(Number(item.exp_rt_amount), item.exp_rt_frequency), 0);

    const soonest = [...dueSoonItems, ...upcomingItems][0];

    return {
      dueSoon: dueSoonItems.map(({ item }) => item),
      upcoming: upcomingItems.map(({ item }) => item),
      paused: pausedItems,
      monthlyOutflow: outflow,
      monthlyIncome: income,
      next: soonest,
    };
  }, [recurringTransactions]);

  const renderGroup = (title: string, items: IRecurringTransaction[]) => {
    if (items.length === 0) return null;
    return (
      <View style={{ marginTop: 16 }}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: colors.lighterTitle }]}>{title}</Text>
          <View style={[styles.countPill, { backgroundColor: colors.inputColor }]}>
            <Text style={[styles.countText, { color: colors.description }]}>{items.length}</Text>
          </View>
        </View>
        {items.map((item) => (
          <SwipeableRow key={item.exp_rt_id} onDelete={() => handleDelete(item.exp_rt_id)}>
            <RecurringTransactionCard {...item} onToggleActive={handleToggleActive} />
          </SwipeableRow>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
      style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <ThemedView style={{ flex: 1, paddingHorizontal: 5 }}>
          {loading && <OverlayLoader />}
          <ProfileHeader title="Recurring Transactions">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${colors.primary}1A` }]}
                onPress={() => router.push('/import-recurring-transactions')}>
                <MaterialIcons name="swap-vert" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${colors.primary}1A` }]}
                onPress={() => router.push('/recurring-transaction')}>
                <MaterialIcons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </ProfileHeader>

          <FlatList
            bounces={false}
            showsVerticalScrollIndicator={false}
            data={[1]}
            keyExtractor={() => 'page-wrapper'}
            renderItem={null as any}
            contentContainerStyle={{ paddingBottom: 50, paddingTop: 5, paddingHorizontal: 15 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListHeaderComponent={
              recurringTransactions.length === 0 ? (
                <Emptystate
                  title="No recurring transactions yet"
                  description="Add bills or income that repeat on a schedule to get reminded automatically."
                />
              ) : (
                <>
                  {(dueSoon.length > 0 || upcoming.length > 0) && (
                    <RecurringSummaryCard
                      monthlyOutflow={monthlyOutflow}
                      monthlyIncome={monthlyIncome}
                      nextTitle={next?.item.exp_rt_title}
                      nextDaysUntil={next?.daysUntil}
                    />
                  )}
                  {renderGroup('Due Soon', dueSoon)}
                  {renderGroup('Upcoming', upcoming)}
                  {renderGroup('Paused', paused)}
                </>
              )
            }
          />
        </ThemedView>
      </SafeAreaViewComponent>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  countPill: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  countText: {
    fontSize: 10,
    fontFamily: 'Inter-700',
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
