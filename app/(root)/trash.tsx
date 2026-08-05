import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { differenceInCalendarDays, format } from 'date-fns';

import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import ProfileHeader from '@/components/ProfileHeader';
import TransactionCard from '@/components/TransactionCard';
import Emptystate from '@/components/Emptystate';
import OverlayLoader from '@/components/Overlay';
import Spacer from '@/components/Spacer';
import { showToast } from '@/components/ToastMessage';
import {
  useGetTrashedTransactions,
  usePurgeTransaction,
  useRestoreTransaction,
} from '@/hooks/useTransaction';
import { useGetSettingsFromStore } from '@/hooks/useGetSettingsValue';
import { useThemeContext } from '@/contexts/ThemedContext';
import { getApiErrorMessage } from '@/lib/apiClient';
import { formatToCurrency } from '@/utils/formatter';
import { FontSize } from '@/utils/Typography';
import { Itransaction } from '@/types';

const TRASH_RETENTION_DAYS = 30;

// exp_ts_deleted_at is already returned by the trash API (it's what the list
// is sorted by) but wasn't being read anywhere on this screen - this is the
// only place that turns it into a user-facing "time left" signal.
function getDaysLeft(deletedAt?: string | null): number | null {
  if (!deletedAt) return null;
  const daysSinceDeleted = differenceInCalendarDays(new Date(), new Date(deletedAt));
  return Math.max(0, TRASH_RETENTION_DAYS - daysSinceDeleted);
}

function getDaysLeftTier(daysLeft: number, colors: ReturnType<typeof useThemeContext>['colors']) {
  if (daysLeft <= 3) return { bg: `${colors.expense}1A`, fg: colors.expense };
  if (daysLeft <= 10) return { bg: '#F59E0B1A', fg: '#F59E0B' };
  return { bg: colors.barBackground, fg: colors.lighterTitle };
}

export default function Trash() {
  const { colors } = useThemeContext();
  const { trashed, isLoading, refetch } = useGetTrashedTransactions();
  const { mutateAsync: restoreTransaction } = useRestoreTransaction();
  const { mutateAsync: purgeTransaction } = usePurgeTransaction();

  const [refreshing, setRefreshing] = useState(false);

  const { value } = useGetSettingsFromStore('tt-time');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const handleRestore = (exp_ts_id: string) => {
    restoreTransaction(exp_ts_id)
      .then(() => {
        showToast({ text1: 'Transaction restored.', type: 'success', position: 'bottom' });
      })
      .catch((err) => {
        showToast({
          text1: getApiErrorMessage(err, 'Could not restore this transaction.'),
          type: 'error',
          position: 'bottom',
        });
      });
  };

  const handlePurge = async (exp_ts_id: string) => {
    const confirm = await new Promise((resolve) =>
      Alert.alert(
        'Delete forever?',
        'This transaction will be permanently deleted and cannot be recovered.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Delete forever', style: 'destructive', onPress: () => resolve(true) },
        ],
      ),
    );

    if (!confirm) return;

    purgeTransaction(exp_ts_id)
      .then(() => {
        showToast({
          text1: 'Transaction permanently deleted.',
          type: 'success',
          position: 'bottom',
        });
      })
      .catch((err) => {
        showToast({
          text1: getApiErrorMessage(err, 'Could not delete this transaction.'),
          type: 'error',
          position: 'bottom',
        });
      });
  };

  const sections = useMemo(() => {
    const groups = new Map<
      string,
      { title: string; income: number; expense: number; data: Itransaction[] }
    >();

    (trashed as Itransaction[]).forEach((item) => {
      const dateKey = item.exp_ts_date;
      if (!groups.has(dateKey)) {
        groups.set(dateKey, {
          title: format(new Date(dateKey), 'dd MMMM yyyy'),
          income: 0,
          expense: 0,
          data: [],
        });
      }
      const group = groups.get(dateKey)!;
      group.data.push(item);
      const amount = Number(item.exp_ts_amount) || 0;
      if (item.exp_tt_id === 2) group.income += amount;
      else group.expense += amount;
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([, group]) => group);
  }, [trashed]);

  return (
    <KeyboardAvoidingView
      {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
      style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <ThemedView style={{ flex: 1, paddingHorizontal: 5 }}>
          {isLoading && <OverlayLoader />}
          <ProfileHeader title="Trash" />
          <Text style={[styles.itemCount, { color: colors.description }]}>
            {trashed.length} {trashed.length === 1 ? 'item' : 'items'}
          </Text>
          <Spacer height={10} />

          <SectionList
            bounces={false}
            showsVerticalScrollIndicator={false}
            sections={sections}
            style={{ paddingHorizontal: 10 }}
            contentContainerStyle={{ paddingBottom: 50, paddingTop: 5 }}
            ListEmptyComponent={
              <Emptystate
                title="Trash is empty"
                description="Deleted transactions will show up here for 30 days before they're permanently removed."
              />
            }
            ListFooterComponent={
              trashed.length > 0 ? (
                <View style={[styles.policyNote, { backgroundColor: colors.barBackground }]}>
                  <MaterialIcons name="info-outline" size={14} color={colors.lighterTitle} />
                  <Text style={[styles.policyText, { color: colors.description }]}>
                    Deleted transactions are kept for {TRASH_RETENTION_DAYS} days, then removed
                    automatically. Items close to their deadline are flagged above.
                  </Text>
                </View>
              ) : null
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => {
              const daysLeft = getDaysLeft(item.exp_ts_deleted_at);
              const tier = daysLeft !== null ? getDaysLeftTier(daysLeft, colors) : null;
              return (
                <View
                  style={[
                    styles.row,
                    { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
                  ]}>
                  <View style={{ flex: 1 }}>
                    <TransactionCard key={item.exp_ts_id} {...item} showTsTime={value} noRedirect />
                    {daysLeft !== null && tier && (
                      <View style={[styles.daysBadge, { backgroundColor: tier.bg }]}>
                        <View style={[styles.daysDot, { backgroundColor: tier.fg }]} />
                        <Text style={[styles.daysText, { color: tier.fg }]}>
                          {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: `${colors.income}1A` }]}
                      onPress={() => handleRestore(item.exp_ts_id)}>
                      <MaterialIcons name="restore" size={18} color={colors.income} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: `${colors.expense}1A` }]}
                      onPress={() => handlePurge(item.exp_ts_id)}>
                      <MaterialIcons name="delete-sweep" size={18} color={colors.expense} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            renderSectionHeader={({ section: { title, income, expense } }) => (
              <View style={styles.sectionHeader}>
                <Text style={[styles.dateHeader, { color: colors.lighterTitle }]}>{title}</Text>

                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {!!expense && (
                    <Text style={[styles.totalAmount, { color: colors.expense }]}>
                      <Feather name="arrow-up-right" size={14} color={colors.expense} />
                      {formatToCurrency(expense)}
                    </Text>
                  )}
                  {!!income && (
                    <Text style={[styles.totalAmount, { color: colors.income }]}>
                      <Feather name="arrow-down-left" size={14} color={colors.income} />
                      {formatToCurrency(income)}
                    </Text>
                  )}
                </View>
              </View>
            )}
            stickySectionHeadersEnabled={false}
            keyExtractor={(item) => item.exp_ts_id.toString()}
          />
        </ThemedView>
      </SafeAreaViewComponent>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  itemCount: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    marginTop: -6,
    marginLeft: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 6,
    marginBottom: 4,
  },
  dateHeader: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  totalAmount: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 14,
  },
  actions: {
    flexDirection: 'column',
    gap: 6,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginTop: 2,
    marginLeft: 4,
  },
  daysDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  daysText: {
    fontSize: FontSize.xs,
    fontFamily: 'Inter-700',
  },
  policyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  policyText: {
    flex: 1,
    fontSize: FontSize.xs,
    fontFamily: 'Inter-400',
    lineHeight: 16,
  },
});
