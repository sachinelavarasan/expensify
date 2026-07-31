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
import { format } from 'date-fns';

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
import { formatToCurrency } from '@/utils/formatter';
import { FontSize } from '@/utils/Typography';
import { Itransaction } from '@/types';

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
      .catch(() => {
        showToast({
          text1: 'Could not restore this transaction.',
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
        showToast({ text1: 'Transaction permanently deleted.', type: 'success', position: 'bottom' });
      })
      .catch(() => {
        showToast({
          text1: 'Could not delete this transaction.',
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
          <ProfileHeader title="Trash" subtitle={`${trashed.length} item(s)`} />
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
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <TransactionCard key={item.exp_ts_id} {...item} showTsTime={value} noRedirect />
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.inputColor }]}
                    onPress={() => handleRestore(item.exp_ts_id)}>
                    <MaterialIcons name="restore" size={18} color={colors.income} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.inputColor }]}
                    onPress={() => handlePurge(item.exp_ts_id)}>
                    <MaterialIcons name="delete-sweep" size={18} color={colors.expense} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            renderSectionHeader={({ section: { title, income, expense } }) => (
              <View
                style={[styles.sectionHeader, { backgroundColor: colors.bottomBarBackground }]}>
                <Text style={[styles.dateHeader, { color: colors.title }]}>{title}</Text>

                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {!!expense && (
                    <Text style={[styles.totalAmount, { color: colors.lighterTitle }]}>
                      <Feather name="arrow-up-right" size={14} color={colors.expense} />
                      {formatToCurrency(expense)}
                    </Text>
                  )}
                  {!!income && (
                    <Text style={[styles.totalAmount, { color: colors.lighterTitle }]}>
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
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  dateHeader: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-600',
  },
  totalAmount: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
