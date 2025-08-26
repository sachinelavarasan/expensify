import BankCard from '@/components/AccountCard';
import AddAccount from '@/components/AddAccount';
import Emptystate from '@/components/Emptystate';
import ProfileHeader from '@/components/ProfileHeader';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import Spacer from '@/components/Spacer';
import { ThemedView } from '@/components/ThemedView';
import TransactionCard from '@/components/TransactionCard';
import { useThemeContext } from '@/contexts/ThemedContext';
import { useAccountGroupedTransactions } from '@/hooks/useBankAccountOperation';
import { useGetSettingsFromStore } from '@/hooks/useGetSettingsValue';
import { formatToCurrency } from '@/utils/formatter';
import { deviceWidth } from '@/utils/functions';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Text,
  StyleSheet,
  View,
  SectionList,
  ActivityIndicator,
  RefreshControl,
  ColorValue,
} from 'react-native';

const width = deviceWidth();

const cardWidth = width - 30;

export default function AccountScreen() {
  const { theme, colors } = useThemeContext();
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
        <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
          <ProfileHeader title="Account Details" subtitle="All Time" paddingHorizontal={false}>
            <View>
              {!!account?.exp_ba_id && (
                <AddAccount
                  account={{
                    ...account,
                  }}
                  exp_ba_id={account.exp_ba_id}
                />
              )}
            </View>
          </ProfileHeader>
        </View>
        {loading || refreshing || !account ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#6900FF" />
          </View>
        ) : (
          <>
            <Spacer height={10} />
            <View style={{ paddingHorizontal: 15 }}>
              <BankCard
                bankName={account.exp_ba_name}
                holderName={'Elavarasan'}
                icon={account.exp_ba_icon as React.ComponentProps<typeof MaterialIcons>['name']}
                // accountNumber="123456789012"
                balance={account.exp_ba_balance}
                variant={theme === 'system' ? 'dark' : theme}
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
              contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 20 }}
              keyExtractor={(item, index) => item.exp_ts_id.toString()}
              renderItem={({ item }) => (
                <View>
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
                <LinearGradient
                  colors={
                    (theme == 'dark'
                      ? ['#26004d', '#1a0033', '#26004d', '#0d001a']
                      : colors.themedViewBg) as [ColorValue, ColorValue]
                  }
                  start={{ x: 1.5, y: 0 }}
                  end={{ x: 0, y: 1.5 }}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: theme === 'dark' ? '#0d001a' : '#F4F3FF',
                    paddingVertical: 20,
                  }}>
                  <Text style={[styles.dateHeader, { color: colors.title }]}>{title}</Text>

                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {!!expense && (
                      <Text style={[styles.totalAmount, { color: colors.lighterTitle }]}>
                        <Feather name="arrow-up-right" size={14} color="#FF4D4F" />
                        {formatToCurrency(expense)}
                      </Text>
                    )}
                    {!!income && (
                      <Text style={[styles.totalAmount, { color: colors.lighterTitle }]}>
                        <Feather name="arrow-down-left" size={14} color="#00C896" />
                        {formatToCurrency(income)}
                      </Text>
                    )}
                  </View>
                </LinearGradient>
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
