import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useState } from 'react';
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

  const handleDelete = (id: number) => {
    deleteRecurringTransaction(id).catch(() => {
      showToast({ text1: 'Failed to delete recurring transaction', type: 'error', position: 'bottom' });
    });
  };

  const handleToggleActive = (id: number, value: boolean) => {
    updateRecurringTransaction({ exp_rt_id: id, exp_rt_is_active: value }).catch(() => {
      showToast({ text1: 'Failed to update recurring transaction', type: 'error', position: 'bottom' });
    });
  };

  return (
    <KeyboardAvoidingView
      {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
      style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <ThemedView style={{ flex: 1, paddingHorizontal: 5 }}>
          {loading && <OverlayLoader />}
          <ProfileHeader title="Recurring Transactions">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity onPress={() => router.push('/import-recurring-transactions')}>
                <MaterialIcons name="playlist-add-check" size={24} color={colors.arrowColor} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/recurring-transaction')}>
                <MaterialIcons name="add-circle-outline" size={24} color={colors.arrowColor} />
              </TouchableOpacity>
            </View>
          </ProfileHeader>

          <FlatList
            bounces={false}
            showsVerticalScrollIndicator={false}
            data={recurringTransactions}
            contentContainerStyle={{ paddingBottom: 50, paddingTop: 5, paddingHorizontal: 15 }}
            ListEmptyComponent={
              <Emptystate
                title="No recurring transactions yet"
                description="Add bills or income that repeat on a schedule to get reminded automatically."
              />
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => (
              <SwipeableRow onDelete={() => handleDelete(item.exp_rt_id)}>
                <View style={{ paddingVertical: 5 }}>
                  <RecurringTransactionCard {...item} onToggleActive={handleToggleActive} />
                </View>
              </SwipeableRow>
            )}
            keyExtractor={(item) => item.exp_rt_id.toString()}
          />
        </ThemedView>
      </SafeAreaViewComponent>
    </KeyboardAvoidingView>
  );
}
