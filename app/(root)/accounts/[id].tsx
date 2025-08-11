import AddAccount from '@/components/AddAccount';
import Emptystate from '@/components/Emptystate';
import ProfileHeader from '@/components/ProfileHeader';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import Spacer from '@/components/Spacer';
import { ThemedView } from '@/components/ThemedView';
import TransactionCard from '@/components/TransactionCard';
import { useAccountGroupedTransactions } from '@/hooks/useBankAccountOperation';
import { useGetSettingsFromStore } from '@/hooks/useGetSettingsValue';
import { formatToCurrency } from '@/utils/formatter';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Text,
  StyleSheet,
  View,
  SectionList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

export default function AccountScreen() {
  const { id } = useLocalSearchParams() as unknown as { id: number };
  const { account, loading, refetch } = useAccountGroupedTransactions(id);
  const { value } = useGetSettingsFromStore('tt-time');

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      refetch();
      setRefreshing(false);
    }, 2000);
  }, [refetch]);

  return (
    <SafeAreaViewComponent edges={['top']}>
      <ThemedView style={styles.container}>
        <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
          <ProfileHeader title="Account Details" subtitle="All Time" />
        </View>
        {loading || refreshing || !account ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#6900FF" />
          </View>
        ) : (
          <>
            <Spacer height={10} />
            <View style={[styles.card, { width: 'auto' }]}>
              <View>
                <Text style={styles.cardTitle}>{account.exp_ba_balance}</Text>
                <Text style={styles.cardSubtitle}>
                  Account: <Text style={{ color: '#D1CCFF' }}>{account.exp_ba_name}</Text>{' '}
                  {account.exp_ba_is_primary && <Text style={styles.default}>Default</Text>}
                </Text>
              </View>
              <View>
                {!!account.exp_ba_id && (
                  <AddAccount
                    account={{
                      ...account,
                    }}
                    exp_ba_id={account.exp_ba_id}
                  />
                )}
              </View>
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
              contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 20 }}
              keyExtractor={(item, index) => item.exp_ts_id.toString()}
              renderItem={({ item }) => (
                <View>
                  <TransactionCard key={item.exp_ts_id} {...item} showTsTime={value}/>
                </View>
              )}
              renderSectionHeader={({ section: { title, income, expense } }) => (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#0F0E17',
                    paddingVertical: 10,
                  }}>
                  <Text style={styles.dateHeader}>{title}</Text>

                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {!!expense && (
                      <Text style={styles.totalAmount}>
                        <Feather name="arrow-up-right" size={12} color="#FF4D4F" />
                        {formatToCurrency(expense)}
                      </Text>
                    )}
                    {!!income && (
                      <Text style={styles.totalAmount}>
                        <Feather name="arrow-down-left" size={12} color="#00C896" />
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
  dateHeader: {
    fontSize: 14,
    fontFamily: 'Inter-600',
    color: '#a19bca',
  },
  header: {
    fontSize: 32,
    backgroundColor: '#fff',
    color: 'red',
  },
  title: {
    fontSize: 24,
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
