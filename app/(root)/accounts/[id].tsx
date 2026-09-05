import BankCard from '@/components/AccountCard';
import AddAccount from '@/components/AddAccount';
import Emptystate from '@/components/Emptystate';
import ModalCard from '@/components/ModalCard';
import ProfileHeader from '@/components/ProfileHeader';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import Spacer from '@/components/Spacer';
import { ThemedView } from '@/components/ThemedView';
import { showToast } from '@/components/ToastMessage';
import TransactionCard from '@/components/TransactionCard';
import { useThemeContext } from '@/contexts/ThemedContext';
import {
  useAccountSummary,
  useAccountTransactions,
  useDeleteBankAccount,
} from '@/hooks/useBankAccountOperation';
import { useGetSettingsFromStore } from '@/hooks/useGetSettingsValue';
import { useGetUserData } from '@/hooks/useUserStore';
import { getApiErrorMessage } from '@/lib/apiClient';
import { FontSize } from '@/utils/Typography';
import { Spacing } from '@/utils/Spacing';
import { formatToCurrency } from '@/utils/formatter';
import { deviceWidth } from '@/utils/functions';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Text,
  StyleSheet,
  View,
  SectionList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

const width = deviceWidth();

const cardWidth = width - 30;

export default function AccountScreen() {
  const { colors } = useThemeContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    account,
    loading: summaryLoading,
    refetch: refetchSummary,
  } = useAccountSummary(id);
  const {
    groups,
    loading: transactionsLoading,
    refetch: refetchTransactions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAccountTransactions(id);
  const { value } = useGetSettingsFromStore('tt-time');
  const { value: showBalance } = useGetSettingsFromStore('balance');
  const { user: currentUser } = useGetUserData();
  const { mutateAsync: deleteAccount, isPending: isDeleting } = useDeleteBankAccount();

  const [refreshing, setRefreshing] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const router = useRouter();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      refetchSummary();
      refetchTransactions();
      setRefreshing(false);
    }, 2000);
  }, [refetchSummary, refetchTransactions]);

  const confirmDelete = () => {
    if (!account?.exp_ba_id) return;
    deleteAccount(account.exp_ba_id)
      .then(() => {
        showToast({
          text1: 'The account has been removed.',
          type: 'success',
          position: 'bottom',
        });
        router.back();
      })
      .catch((err) => {
        showToast({
          text1: getApiErrorMessage(err, 'Server Error'),
          type: 'error',
          position: 'bottom',
        });
      })
      .finally(() => {
        setDeleteConfirmVisible(false);
      });
  };

  return (
    <SafeAreaViewComponent edges={['top']}>
      <ThemedView style={styles.container}>
        <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
          <ProfileHeader title="Account Details" paddingHorizontal={false}>
            <View>
              {!!account?.exp_ba_id && (
                <View style={{ gap: 20, flexDirection: 'row', alignItems: 'center' }}>
                  <AddAccount
                    account={{
                      ...account,
                    }}
                    exp_ba_id={account.exp_ba_id}
                  />
                  <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: `${colors.expense}1A` }]}
                    onPress={() => setDeleteConfirmVisible(true)}
                    disabled={isDeleting}>
                    <MaterialIcons name="delete-forever" size={20} color={colors.expense} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ProfileHeader>
        </View>
        {summaryLoading || transactionsLoading || !account || isDeleting ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <Spacer height={10} />
            <View style={{ paddingHorizontal: 15, marginBottom: 5 }}>
              <BankCard
                bankName={account.exp_ba_name}
                holderName={currentUser?.exp_us_name || ''}
                icon={account.exp_ba_icon as React.ComponentProps<typeof MaterialIcons>['name']}
                balance={account.exp_ba_balance}
                showBalance={showBalance}
                isPrimary={account.exp_ba_is_primary}
                income={account.totalIncome}
                expense={account.totalExpense}
                transactionCount={account.totalTransactionCount}
                variant="ratio"
                otherStyle={{
                  width: cardWidth,
                }}
              />
            </View>
            <SectionList
              ListEmptyComponent={
                <Emptystate
                  title="No transactions found"
                  description="In this account there is no transaction be made."
                />
              }
              sections={groups}
              bounces={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 80 }}
              style={{ paddingHorizontal: 15 }}
              keyExtractor={(item, index) => item.exp_ts_id.toString()}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.4}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View style={{ paddingVertical: 20 }}>
                    <ActivityIndicator color={colors.primary} />
                  </View>
                ) : null
              }
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.row,
                    { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
                  ]}>
                  <TransactionCard key={item.exp_ts_id} {...item} showTsTime={value} />
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
            />
          </>
        )}

        <ModalCard
          visible={deleteConfirmVisible}
          onClose={() => setDeleteConfirmVisible(false)}
          title="Delete this account?"
          closeDisabled={isDeleting}>
          <Text style={{ color: colors.description, fontFamily: 'Inter-500', fontSize: FontSize.sm }}>
            This will permanently remove {account?.exp_ba_name || 'this account'} and cannot be
            undone.
          </Text>
          <Spacer height={24} />
          <View style={{ flexDirection: 'row', gap: Spacing.xl, justifyContent: 'center' }}>
            <TouchableOpacity
              style={[styles.modalButton, { borderColor: colors.inputBorder, borderWidth: 1 }]}
              onPress={() => setDeleteConfirmVisible(false)}
              disabled={isDeleting}>
              <Text style={[styles.modalButtonText, { color: colors.description }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: colors.expense },
                isDeleting ? styles.disable : {},
              ]}
              onPress={confirmDelete}
              disabled={isDeleting}>
              {isDeleting ? (
                <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
              ) : null}
              <Text
                style={[
                  styles.modalButtonText,
                  { color: colors.onPrimary },
                  isDeleting ? styles.textDisable : {},
                ]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </ModalCard>
      </ThemedView>
    </SafeAreaViewComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 60,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    marginHorizontal: 5,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 14,
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
  disable: {
    opacity: 0.7,
  },
  textDisable: { opacity: 0 },
});
