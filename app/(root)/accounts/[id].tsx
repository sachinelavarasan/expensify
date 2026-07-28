import BankCard from '@/components/AccountCard';
import AddAccount from '@/components/AddAccount';
import Emptystate from '@/components/Emptystate';
import ProfileHeader from '@/components/ProfileHeader';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import Spacer from '@/components/Spacer';
import { ThemedView } from '@/components/ThemedView';
import { showToast } from '@/components/ToastMessage';
import TransactionCard from '@/components/TransactionCard';
import { useThemeContext } from '@/contexts/ThemedContext';
import {
  useAccountGroupedTransactions,
  useDeleteBankAccount,
} from '@/hooks/useBankAccountOperation';
import { useGetSettingsFromStore } from '@/hooks/useGetSettingsValue';
import { useGetUserData } from '@/hooks/useUserStore';
import { FontSize } from '@/utils/Typography';
import { formatToCurrency } from '@/utils/formatter';
import { deviceWidth } from '@/utils/functions';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Text,
  StyleSheet,
  View,
  SectionList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';

const width = deviceWidth();

const cardWidth = width - 30;

export default function AccountScreen() {
  const { colors } = useThemeContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { account, loading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useAccountGroupedTransactions(id);
  const { value } = useGetSettingsFromStore('tt-time');
  const { user: currentUser } = useGetUserData();
  const { mutateAsync: deleteAccount, isPending: isDeleting } = useDeleteBankAccount();

  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  const totals = useMemo(() => {
    const groups = account?.data ?? [];
    return groups.reduce(
      (acc, group) => ({
        income: acc.income + Number(group.income || 0),
        expense: acc.expense + Number(group.expense || 0),
        transactionCount: acc.transactionCount + group.data.length,
      }),
      { income: 0, expense: 0, transactionCount: 0 },
    );
  }, [account?.data]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      refetch();
      setRefreshing(false);
    }, 2000);
  }, [refetch]);

  const handleDelete = async () => {
    try {
      const confirm = await new Promise((resolve) =>
        Alert.alert('Delete this account?', 'Are you sure you want to delete this account?', [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
        ]),
      );

      if (!confirm) return;

      if (account?.exp_ba_id)
        deleteAccount(account.exp_ba_id)
          .then(() => {
            showToast({
              text1: 'The account has been removed.',
              type: 'success',
              position: 'bottom',
            });
            router.back()
          })
          .catch(() => {
            showToast({
              text1: 'Server Error',
              type: 'error',
              position: 'bottom',
            });
          });
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <SafeAreaViewComponent edges={['top']}>
      <ThemedView style={styles.container}>
        <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
          <ProfileHeader title="Account Details" subtitle="All Time" paddingHorizontal={false}>
            <View>
              {!!account?.exp_ba_id && (
                <View style={{gap: 20, flexDirection: 'row', alignItems: 'center'}}>
                  <AddAccount
                    account={{
                      ...account,
                    }}
                    exp_ba_id={account.exp_ba_id}
                  />
                  <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: `${colors.expense}1A` }]}
                    onPress={handleDelete}
                    disabled={isDeleting}>
                    <MaterialIcons name="delete-forever" size={20} color={colors.expense} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ProfileHeader>
        </View>
        {loading || !account || isDeleting ? (
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
                income={totals.income}
                expense={totals.expense}
                transactionCount={totals.transactionCount}
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
              sections={account.data}
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
                <View style={{ paddingHorizontal: 5 }}>
                  <TransactionCard key={item.exp_ts_id} {...item} showTsTime={value} />
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
              stickySectionHeadersEnabled={true}
            />
          </>
        )}
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
});
