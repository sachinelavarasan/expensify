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
import { formatToCurrency } from '@/utils/formatter';
import { deviceWidth } from '@/utils/functions';
import { useUser } from '@clerk/clerk-expo';
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
  Alert,
} from 'react-native';

const width = deviceWidth();

const cardWidth = width - 30;

export default function AccountScreen() {
  const { theme, colors } = useThemeContext();
  const { id } = useLocalSearchParams() as unknown as { id: number };
  const { account, loading, refetch } = useAccountGroupedTransactions(id);
  const { value } = useGetSettingsFromStore('tt-time');
  const { user: currentUser } = useUser();
  const { mutateAsync: deleteAccount, isPending: isDeleting } = useDeleteBankAccount();

  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

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
        deleteAccount(Number(account?.exp_ba_id))
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
                  <TouchableOpacity onPress={handleDelete} disabled={isDeleting}>
                    <MaterialIcons name="delete-forever" size={30} color={colors.expense} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ProfileHeader>
        </View>
        {loading || refreshing || !account || isDeleting ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <Spacer height={10} />
            <View style={{ paddingHorizontal: 15, marginBottom: 5 }}>
              <BankCard
                bankName={account.exp_ba_name}
                holderName={currentUser?.firstName || ''}
                icon={account.exp_ba_icon as React.ComponentProps<typeof MaterialIcons>['name']}
                // accountNumber="123456789012"
                balance={account.exp_ba_balance}
                variant={theme === 'dark' ? 'dark' : 'light'}
                // variant="dark"
                accent="#6C63FF"
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
              renderItem={({ item }) => (
                <View style={{ paddingHorizontal: 5 }}>
                  <TransactionCard key={item.exp_ts_id} {...item} showTsTime={value} />
                </View>
              )}
              renderSectionHeader={({ section: { title, income, expense } }) => (
                // <View
                //   style={{
                //     flexDirection: 'row',
                //     justifyContent: 'space-between',
                //     alignItems: 'center',
                //     backgroundColor: theme === 'dark' ? '#0d001a' : '#F4F3FF',
                //     paddingVertical: 10,
                //   }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: colors.themedViewBg[0],
                    paddingVertical: 16,
                    paddingHorizontal: 10,
                    borderRadius: 4,
                  }}>
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
                // </View>
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
  dateHeader: {
    fontSize: 14,
    fontFamily: 'Inter-600',
    color: '#a19bca',
  },
  header: {
    fontSize: 32,
    backgroundColor: '#fff',
    color: 'red',
    fontFamily: 'Inter-600',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-600',
  },
  totalAmount: {
    color: '#D5D5D5',
    fontSize: 14,
    fontFamily: 'Inter-500',
  },
  card: {
    borderColor: '#5a4f96',
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    columnGap: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  cardTitle: {
    color: '#F4F5F8',
    fontSize: 16,
    fontFamily: 'Inter-700',
    paddingBottom: 5,
  },
  cardSubtitle: {
    color: '#CCC',
    fontSize: 14,
    fontFamily: 'Inter-500',
  },
  default: {
    color: '#8880A0',
    fontSize: 10,
    fontFamily: 'Inter-500',
    verticalAlign: 'middle',
  },
});
