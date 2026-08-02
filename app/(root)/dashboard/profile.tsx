import { Link, useRouter, type Href } from 'expo-router';
import React from 'react';

import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { deviceWidth } from '@/utils/functions';

import { ThemedView } from '@/components/ThemedView';
import ProfileHeaderCard from '@/components/ProfileHeaderCard';
import { MaterialIcons } from '@expo/vector-icons';
import { useBankAccounts } from '@/hooks/useBankAccountOperation';
import { useNetWorth } from '@/hooks/useNetWorth';
import AddAccount from '@/components/AddAccount';
import Spacer from '@/components/Spacer';
import { useGetUserData } from '@/hooks/useUserStore';
import BankCard from '@/components/AccountCard';
import { useThemeContext } from '@/contexts/ThemedContext';
import LogoutButton from '@/components/LogOutModal';
import ProfileAccountsSummaryCard from '@/components/ProfileAccountsSummaryCard';
import { FontSize } from '@/utils/Typography';
import { useGetSettingsFromStore } from '@/hooks/useGetSettingsValue';

const MENU_ITEMS: {
  href: Href;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  subtitle: string;
}[] = [
  {
    href: '/(root)/categories',
    icon: 'category',
    title: 'Categories',
    subtitle: 'Keep your spending neatly sorted',
  },
  {
    href: '/(root)/starred',
    icon: 'star',
    title: 'Starred Transactions',
    subtitle: 'Access your favorite transactions quickly',
  },
  {
    href: '/(root)/recurring-transactions',
    icon: 'event-repeat',
    title: 'Recurring Transactions',
    subtitle: 'Get reminders for bills and income that repeat',
  },
  {
    href: '/(root)/debts',
    icon: 'handshake',
    title: 'Debts & Loans',
    subtitle: 'Track money you’ve lent or borrowed',
  },
  {
    href: '/(root)/export-transactions',
    icon: 'import-export',
    title: 'Import / Export Transactions',
    subtitle: 'Download and share your transaction history',
  },
  {
    href: '/(root)/trash',
    icon: 'delete-outline',
    title: 'Trash',
    subtitle: 'Restore or permanently delete removed transactions',
  },
  {
    href: '/(root)/settings',
    icon: 'settings',
    title: 'Settings',
    subtitle: 'Customize your app preferences and controls',
  },
];

const Profile = () => {
  const { colors } = useThemeContext();
  const router = useRouter();
  const { accounts, loading } = useBankAccounts();
  const { user: currentUser, refetch } = useGetUserData();
  const { value: showBalance } = useGetSettingsFromStore('balance');

  const { netWorth: overAllAmount } = useNetWorth(accounts);
  const primaryAccount = accounts.find((item) => item.exp_ba_is_primary);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ProfileHeaderCard
          title={currentUser?.exp_us_name || ''}
          subtitle={currentUser?.exp_us_email || ''}
          refetch={refetch}
        />
        <Spacer height={20} />
        <Animated.View entering={FadeInDown.duration(650).easing(Easing.out(Easing.quad))}>
          <ProfileAccountsSummaryCard
            totalBalance={overAllAmount}
            accountsCount={accounts.length}
            primaryAccountName={primaryAccount?.exp_ba_name}
            showBalance={showBalance}
          />
        </Animated.View>
        <Spacer height={20} />
        <View
          style={[
            styles.card,
            { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
          ]}>
          <View style={styles.left}>
            <View style={{ backgroundColor: colors.primary, padding: 6, borderRadius: 8 }}>
              <MaterialIcons name="account-balance" size={24} color={colors.onPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <View>
                <Text style={[styles.option, { color: colors.title }]}>Manage Accounts</Text>
              </View>
              <View style={styles.subTextContainer}>
                <Text style={[styles.subText, { color: colors.description }]}>
                  Add or edit your bank accounts
                </Text>
              </View>
            </View>
          </View>

          <View style={{ marginRight: -6 }}>{<AddAccount />}</View>
        </View>
        <FlatList
          contentContainerStyle={{
            marginTop: 5,
            marginBottom: 15,
            gap: 10,
            padding: 5,
          }}
          horizontal
          bounces={false}
          showsHorizontalScrollIndicator={false}
          data={accounts}
          keyExtractor={(item) => item.exp_ba_name}
          ListEmptyComponent={() =>
            !loading && accounts.length ? (
              <Spacer height={60} />
            ) : (
              <View style={{ height: 60, justifyContent: 'center' }}>
                <Text style={[styles.subText, { color: colors.description }]}>
                  There is no account exist
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <BankCard
              bankName={item.exp_ba_name}
              holderName={currentUser?.exp_us_name || ''}
              icon={item.exp_ba_icon as React.ComponentProps<typeof MaterialIcons>['name']}
              balance={item.exp_ba_balance}
              showBalance={showBalance}
              isPrimary={item.exp_ba_is_primary}
              onPress={() => {
                router.push(`/accounts/${item.exp_ba_id}`);
              }}
              otherStyle={{ width: deviceWidth() - 60 }}
            />
          )}
        />
        <Spacer height={4} />
        {MENU_ITEMS.map((item) => (
          <Link key={String(item.href)} href={item.href} asChild>
            <TouchableOpacity>
              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
                ]}>
                <View style={styles.left}>
                  <View style={{ backgroundColor: colors.primary, padding: 6, borderRadius: 8 }}>
                    <MaterialIcons name={item.icon} size={24} color={colors.onPrimary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View>
                      <Text style={[styles.option, { color: colors.title }]}>{item.title}</Text>
                    </View>
                    <View style={styles.subTextContainer}>
                      <Text style={[styles.subText, { color: colors.description }]}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </View>
                </View>

                <MaterialIcons name="chevron-right" size={22} color={colors.lighterTitle} />
              </View>
            </TouchableOpacity>
          </Link>
        ))}
        <Spacer height={40} />
        <View style={[styles.btnContainer, { paddingHorizontal: 5, flex: 1 }]}>
          <LogoutButton />
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 60,
  },
  btnContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  card: {
    paddingVertical: 8,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  option: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-600',
  },
  subText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    flexShrink: 1,
  },
  subTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginTop: 2,
  },
});

export default Profile;
