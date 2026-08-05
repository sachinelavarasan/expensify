import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';

import { useThemeContext } from '@/contexts/ThemedContext';
import { formatToCurrency } from '@/utils/formatter';
import { FontSize } from '@/utils/Typography';
import useCountUp from '@/hooks/useCountUp';

interface Props {
  totalBalance: number;
  accountsCount: number;
  primaryAccountName?: string;
  // Mirrors the "Hide Balance" setting - true means the balance should be masked.
  showBalance?: boolean;
}

export default function ProfileAccountsSummaryCard({
  totalBalance,
  accountsCount,
  primaryAccountName,
  showBalance,
}: Props) {
  const { colors } = useThemeContext();
  const animatedBalance = useCountUp(totalBalance);
  const animatedAccountsCount = useCountUp(accountsCount, 600);

  // "base" reflects the persisted setting; a peek toggle can temporarily
  // override it for this render only - it resets next time the card mounts.
  const [peeked, setPeeked] = useState(false);
  const isBaseBalanceVisible = !showBalance;
  const isBalanceVisible = isBaseBalanceVisible || peeked;

  return (
    <View style={[styles.card, { backgroundColor: colors.primary }]}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.onPrimary }]}>Total Balance</Text>
        {!isBaseBalanceVisible && (
          <TouchableOpacity onPress={() => setPeeked((prev) => !prev)} hitSlop={8}>
            <Feather
              name={isBalanceVisible ? 'eye' : 'eye-off'}
              size={13}
              color={colors.onPrimary}
            />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.balance, { color: colors.onPrimary }]} numberOfLines={1}>
        {isBalanceVisible ? formatToCurrency(animatedBalance, undefined, totalBalance) : '••••••'}
      </Text>

      <View style={styles.row}>
        <Animated.View
          entering={FadeInDown.duration(550).delay(180).easing(Easing.out(Easing.quad))}
          style={[styles.stat, styles.statPill]}>
          <View style={[styles.dot, { backgroundColor: colors.onPrimarySubtle }]}>
            <Feather name="credit-card" size={11} color={colors.onPrimary} />
          </View>
          <View>
            <Text style={[styles.statLabel, { color: colors.onPrimary }]}>Accounts</Text>
            <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
              {Math.round(animatedAccountsCount)}
            </Text>
          </View>
        </Animated.View>
        {!!primaryAccountName && (
          <Animated.View
            entering={FadeInDown.duration(550).delay(260).easing(Easing.out(Easing.quad))}
            style={[styles.stat, styles.statPill]}>
            <View style={[styles.dot, { backgroundColor: colors.onPrimarySubtle }]}>
              <Feather name="star" size={11} color={colors.onPrimary} />
            </View>
            <View>
              <Text style={[styles.statLabel, { color: colors.onPrimary }]}>Primary</Text>
              <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
                {primaryAccountName}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>

      {accountsCount === 0 && (
        <View style={[styles.footer, { borderTopColor: colors.onPrimaryBorder }]}>
          <Text style={[styles.footerText, { color: colors.onPrimary }]}>
            Add your first account to get started
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
  },
  label: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.75,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balance: {
    fontSize: FontSize.display,
    fontFamily: 'Inter-700',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statPill: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 11,
    padding: 10,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter-600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    opacity: 0.75,
  },
  statValue: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-700',
    marginTop: 1,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
    opacity: 0.9,
  },
});
