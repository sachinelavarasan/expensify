import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';

import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import ProfileHeader from '@/components/ProfileHeader';
import TransactionCard from '@/components/TransactionCard';
import Emptystate from '@/components/Emptystate';
import OverlayLoader from '@/components/Overlay';
import Spacer from '@/components/Spacer';
import StarredSummaryCard from '@/components/StarredSummaryCard';
import { useGetStarredTransactions } from '@/hooks/useStarredTransactions';
import { useGetSettingsFromStore } from '@/hooks/useGetSettingsValue';
import { useThemeContext } from '@/contexts/ThemedContext';
import { formatToCurrency } from '@/utils/formatter';
import { FontSize } from '@/utils/Typography';
import { Itransaction } from '@/types';

export default function Starred() {
  const { colors } = useThemeContext();
  const { starred, isLoading, refetch } = useGetStarredTransactions();

  const [refreshing, setRefreshing] = useState(false);

  const { value } = useGetSettingsFromStore('tt-time');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

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
                <TransactionCard key={item.exp_ts_id} {...item} isStarred showTsTime={value} />
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
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 14,
  },
});
