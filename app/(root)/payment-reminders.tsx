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
import {
  useDeleteRecurringTransaction,
  useRecurringTransactions,
  useUpdateRecurringTransaction,
} from '@/hooks/useRecurringTransaction';
import { useThemeContext } from '@/contexts/ThemedContext';
import { showToast } from '@/components/ToastMessage';
import { getApiErrorMessage } from '@/lib/apiClient';
import { IRecurringTransaction } from '@/types';
import { RECURRING_DUE_SOON_DAYS, getNextOccurrenceDate } from '@/utils/recurringAlerts';
import { differenceInCalendarDays } from 'date-fns';
import { FontSize } from '@/utils/Typography';

export default function PaymentReminders() {
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
        text1: getApiErrorMessage(err, 'Failed to delete payment reminder'),
        type: 'error',
        position: 'bottom',
      });
    });
  };

  const handleToggleActive = (id: string, value: boolean) => {
    updateRecurringTransaction({ exp_rt_id: id, exp_rt_is_active: value }).catch((err) => {
      showToast({
        text1: getApiErrorMessage(err, 'Failed to update payment reminder'),
        type: 'error',
        position: 'bottom',
      });
    });
  };

  const reminders = useMemo(
    () => recurringTransactions.filter((item) => item.exp_rt_kind === 'reminder'),
    [recurringTransactions],
  );

  const { dueSoon, upcoming, paused } = useMemo(() => {
    const active = reminders.filter((item) => item.exp_rt_is_active);
    const pausedItems = reminders.filter((item) => !item.exp_rt_is_active);

    const withDays = active
      .map((item) => {
        const nextOccurrence = getNextOccurrenceDate(
          item.exp_rt_start_date,
          item.exp_rt_frequency,
          item.exp_rt_end_date,
        );
        return nextOccurrence
          ? { item, daysUntil: differenceInCalendarDays(nextOccurrence, new Date()) }
          : null;
      })
      .filter((entry): entry is { item: IRecurringTransaction; daysUntil: number } => entry !== null);
    const dueSoonItems = withDays
      .filter(({ daysUntil }) => daysUntil <= RECURRING_DUE_SOON_DAYS)
      .sort((a, b) => a.daysUntil - b.daysUntil);
    const upcomingItems = withDays
      .filter(({ daysUntil }) => daysUntil > RECURRING_DUE_SOON_DAYS)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    return {
      dueSoon: dueSoonItems.map(({ item }) => item),
      upcoming: upcomingItems.map(({ item }) => item),
      paused: pausedItems,
    };
  }, [reminders]);

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
          <ProfileHeader title="Payment Reminders">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${colors.primary}1A` }]}
                onPress={() => router.push('/planned-reminder?kind=reminder')}>
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
              reminders.length === 0 ? (
                <Emptystate
                  title="No payment reminders yet"
                  description="Add a reminder for bills you pay yourself, like EMIs, so you never miss a due date."
                />
              ) : (
                <>
                  <View style={styles.countHeader}>
                    <Text style={[styles.countHeaderText, { color: colors.title }]}>
                      {reminders.length} payment reminder{reminders.length === 1 ? '' : 's'}
                    </Text>
                    <Text style={[styles.countHeaderSubtext, { color: colors.description }]}>
                      You'll be notified locally when each one is due.
                    </Text>
                  </View>
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
  countHeader: {
    paddingVertical: 4,
  },
  countHeaderText: {
    fontSize: FontSize.lg,
    fontFamily: 'Inter-700',
  },
  countHeaderSubtext: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    marginTop: 2,
  },
});
