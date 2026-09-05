import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useThemeContext } from '@/contexts/ThemedContext';
import { useGetUserData } from '@/hooks/useUserStore';
import ModalCard from '@/components/ModalCard';
import ChipSelect from '@/components/ChipSelect';
import GroupingModal from '@/components/GroupingModal';
import { BankAccount } from '@/types';

const AVATAR_SIZE = 36;

type DateRangeType = 'daily' | 'weekly' | 'monthly';

interface Props {
  accounts: BankAccount[];
  selectedAccountIds: (string | number)[];
  onSelectAccount: (ids: (string | number)[]) => void;
  grouping: DateRangeType;
  updateGrouping: (value: DateRangeType) => void;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning!';
  if (hour < 17) return 'Good Afternoon!';
  return 'Good Evening!';
};

const ALL_ACCOUNTS_ID = 'all';

export default function HomeHeader({
  accounts,
  selectedAccountIds,
  onSelectAccount,
  grouping,
  updateGrouping,
}: Props) {
  const { colors } = useThemeContext();
  const router = useRouter();
  const { user } = useGetUserData();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [accountPillWidth, setAccountPillWidth] = useState<number>();

  const greeting = useMemo(getGreeting, []);
  const firstName = user?.exp_us_name?.trim().split(' ')[0] || 'there';

  const selectedAccount =
    selectedAccountIds.length === 1
      ? accounts.find((acc) => acc.exp_ba_id === selectedAccountIds[0])
      : undefined;
  const pillLetters = selectedAccount?.exp_ba_name?.trim().slice(0, 2).toUpperCase() || 'AL';

  const accountOptions = useMemo(
    () => [
      { id: ALL_ACCOUNTS_ID, label: 'All Accounts' },
      ...accounts.map((acc) => ({ id: acc.exp_ba_id, label: acc.exp_ba_name })),
    ],
    [accounts],
  );

  const handleSelectAccount = (id: string | number) => {
    onSelectAccount(id === ALL_ACCOUNTS_ID ? [] : [id]);
    setPickerVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <TouchableOpacity onPress={() => router.push('/(root)/dashboard/profile')} hitSlop={4}>
          {user?.exp_us_profile_url ? (
            <Image source={{ uri: user.exp_us_profile_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.primary }]}>
              <FontAwesome6 name="user" size={14} color={colors.onPrimary} />
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.textBlock}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.title }]} numberOfLines={1}>
              {firstName}
            </Text>
            <Text style={styles.wave}>👋</Text>
          </View>
          <Text style={[styles.greeting, { color: colors.description }]} numberOfLines={1}>
            {greeting}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <TouchableOpacity
          onPress={() => setPickerVisible(true)}
          onLayout={(e) => setAccountPillWidth(e.nativeEvent.layout.width)}
          style={[styles.accountPill, { borderColor: colors.borderColor }]}
          hitSlop={4}>
          <MaterialIcons name="account-balance-wallet" size={13} color={colors.arrowColor} />
          <Text style={[styles.accountPillText, { color: colors.title }]}>{pillLetters}</Text>
          <MaterialIcons name="keyboard-arrow-down" size={16} color={colors.arrowColor} />
        </TouchableOpacity>

        <GroupingModal grouping={grouping} update={updateGrouping} triggerWidth={accountPillWidth} />
      </View>

      <ModalCard
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        presentation="sheet"
        title="Choose Account">
        <ChipSelect
          variant="chip"
          value={selectedAccount?.exp_ba_id ?? ALL_ACCOUNTS_ID}
          options={accountOptions}
          onChange={handleSelectAccount}
        />
      </ModalCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 5,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    gap: 10,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flexShrink: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Inter-700',
    flexShrink: 1,
  },
  wave: {
    fontSize: 14,
  },
  greeting: {
    fontSize: 12,
    fontFamily: 'Inter-400',
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  accountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 2,
  },
  accountPillText: {
    fontSize: 14,
    fontFamily: 'Inter-700',
  },
});
