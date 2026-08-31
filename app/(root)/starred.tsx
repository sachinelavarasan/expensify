import {
  ActivityIndicator,
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
import { format } from 'date-fns';

import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import ProfileHeader from '@/components/ProfileHeader';
import TransactionCard from '@/components/TransactionCard';
import Emptystate from '@/components/Emptystate';
import OverlayLoader from '@/components/Overlay';
import Spacer from '@/components/Spacer';
import ModalCard from '@/components/ModalCard';
import StarredSummaryCard from '@/components/StarredSummaryCard';
import { showToast } from '@/components/ToastMessage';
import { useGetStarredTransactions, useUnstarTransaction } from '@/hooks/useStarredTransactions';
import { useGetSettingsFromStore } from '@/hooks/useGetSettingsValue';
import { useThemeContext } from '@/contexts/ThemedContext';
import { getApiErrorMessage } from '@/lib/apiClient';
import { formatToCurrency } from '@/utils/formatter';
import { FontSize } from '@/utils/Typography';
import { Spacing } from '@/utils/Spacing';
import { Itransaction } from '@/types';

export default function Starred() {
  const { colors } = useThemeContext();
  const { starred, isLoading, refetch } = useGetStarredTransactions();
  const { mutateAsync: unstarTransaction, isPending: isUnstarring } = useUnstarTransaction();

  const [refreshing, setRefreshing] = useState(false);
  const [pendingUnstar, setPendingUnstar] = useState<Itransaction | null>(null);

  const { value } = useGetSettingsFromStore('tt-time');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const confirmUnstar = () => {
    if (!pendingUnstar) return;
    unstarTransaction(pendingUnstar.exp_ts_id)
      .then(() => {
        showToast({ text1: 'Removed from starred.', type: 'success', position: 'bottom' });
      })
      .catch((err) => {
        showToast({
          text1: getApiErrorMessage(err, 'Could not remove this transaction.'),
          type: 'error',
          position: 'bottom',
        });
      })
      .finally(() => {
        setPendingUnstar(null);
      });
  };

  const totals = useMemo(() => {
    return (starred as Itransaction[]).reduce(
      (acc, item) => {
        const amount = Number(item.exp_ts_amount) || 0;
        if (item.exp_tt_id === 2) acc.income += amount;
        else acc.expense += amount;
        return acc;
      },
      { income: 0, expense: 0 },
    );
  }, [starred]);

  const sections = useMemo(() => {
    const groups = new Map<
      string,
      { title: string; income: number; expense: number; data: Itransaction[] }
    >();

    (starred as Itransaction[]).forEach((item) => {
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
  }, [starred]);

  return (
    <KeyboardAvoidingView
      {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
      style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <ThemedView style={{ flex: 1, paddingHorizontal: 5 }}>
          {isLoading && <OverlayLoader />}
          <ProfileHeader title="Starred Transactions" />

          <SectionList
            bounces={false}
            showsVerticalScrollIndicator={false}
            sections={sections}
            style={{ paddingHorizontal: 10 }}
            contentContainerStyle={{ paddingBottom: 50, paddingTop: 5 }}
            ListHeaderComponent={
              <>
                <StarredSummaryCard
                  count={starred.length}
                  totalIncome={totals.income}
                  totalExpense={totals.expense}
                />
                <Spacer height={16} />
              </>
            }
            ListEmptyComponent={
              <Emptystate
                title="No starred transactions added yet"
                description="Start by adding your income or expenses to see them here."
              />
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.row,
                  { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
                ]}>
                <View style={{ flex: 1 }}>
                  <TransactionCard key={item.exp_ts_id} {...item} isStarred showTsTime={value} />
                </View>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: `${colors.favorite}1A` }]}
                  onPress={() => setPendingUnstar(item)}>
                  <MaterialIcons name="star" size={18} color={colors.favorite} />
                </TouchableOpacity>
              </View>
            )}
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

          <ModalCard
            visible={!!pendingUnstar}
            onClose={() => setPendingUnstar(null)}
            title="Remove from Starred?"
            closeDisabled={isUnstarring}>
            <Text
              style={{ color: colors.description, fontFamily: 'Inter-500', fontSize: FontSize.sm }}>
              {pendingUnstar?.exp_ts_title} will no longer appear in your starred transactions. You
              can star it again anytime.
            </Text>
            <Spacer height={24} />
            <View style={{ flexDirection: 'row', gap: Spacing.xl, justifyContent: 'center' }}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.inputBorder, borderWidth: 1 }]}
                onPress={() => setPendingUnstar(null)}
                disabled={isUnstarring}>
                <Text style={[styles.modalButtonText, { color: colors.description }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={confirmUnstar}
                disabled={isUnstarring}>
                {isUnstarring ? (
                  <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
                ) : null}
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: colors.onPrimary },
                    isUnstarring ? styles.textDisable : {},
                  ]}>
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          </ModalCard>
        </ThemedView>
      </SafeAreaViewComponent>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 9,
  },
  modalButtonText: {
    fontSize: FontSize.md,
    fontFamily: 'Inter-600',
  },
  loader: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textDisable: {
    opacity: 0,
  },
});
