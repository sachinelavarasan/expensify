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
import SettingsRow from '@/components/SettingsRow';
import { FontSize } from '@/utils/Typography';
import { useGetSettingsFromStore } from '@/hooks/useGetSettingsValue';

type MenuItem = {
  href: Href;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  subtitle: string;
};

const MENU_GROUPS: { label: string; items: MenuItem[] }[] = [
  {
    label: 'Transactions',
    items: [
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
        href: '/(root)/payment-reminders',
        icon: 'notifications-active',
        title: 'Payment Reminders',
        subtitle: 'Get reminded to pay bills like EMIs, without auto-logging them',
      },
      {
        href: '/(root)/export-import-transactions',
        icon: 'import-export',
        title: 'Import / Export Transactions',
        subtitle: 'Download and share your transaction history',
      },
      {
        href: '/(root)/trash',
        icon: 'auto-delete',
        title: 'Trash',
        subtitle: 'Restore or permanently delete removed transactions',
      },
    ],
  },
  {
    label: 'Organize',
    items: [
      {
        href: '/(root)/categories',
        icon: 'category',
        title: 'Categories',
        subtitle: 'Keep your spending neatly sorted',
      },
      {
        href: '/(root)/debts',
        icon: 'handshake',
        title: 'Debts & Loans',
        subtitle: 'Track money you’ve lent or borrowed',
      },
    ],
  },
  {
    label: 'App',
    items: [
      {
        href: '/(root)/settings',
        icon: 'settings',
        title: 'Settings',
        subtitle: 'Customize your app preferences and controls',
      },
    ],
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
        <Text style={[styles.screenTitle, { color: colors.title }]}>Profile</Text>
        <Spacer height={16} />
        <ProfileHeaderCard
          title={currentUser?.exp_us_name || ''}
          subtitle={currentUser?.exp_us_email || ''}
          verified={currentUser?.exp_us_email_verified}
          createdAt={currentUser?.exp_us_created_at}
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
            styles.section,
            { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
          ]}>
          <SettingsRow
            icon={<MaterialIcons name="account-balance" size={20} color={colors.primary} />}
            iconBg={`${colors.primary}1A`}
            title="Manage Accounts"
            subtitle="Add or edit your bank accounts"
            noCard
            right={<AddAccount />}
          />
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
        {MENU_GROUPS.map((group) => (
          <View key={group.label} style={{ marginBottom: 22 }}>
            <Text style={[styles.sectionLabel, { color: colors.description }]}>{group.label}</Text>
            <View
              style={[
                styles.section,
                { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
              ]}>
              {group.items.map((item, index) => (
                <Link key={String(item.href)} href={item.href} asChild>
                  <TouchableOpacity activeOpacity={0.7}>
                    <SettingsRow
                      icon={<MaterialIcons name={item.icon} size={20} color={colors.primary} />}
                      iconBg={`${colors.primary}1A`}
                      title={item.title}
                      subtitle={item.subtitle}
                      noCard
                      topDivider={index > 0}
                      right={
                        <MaterialIcons name="chevron-right" size={22} color={colors.lighterTitle} />
                      }
                    />
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          </View>
        ))}
        <Spacer height={18} />
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
  screenTitle: {
    fontSize: FontSize.xxl,
    fontFamily: 'Inter-700',
  },
  btnContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  subText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    flexShrink: 1,
  },
});

export default Profile;
