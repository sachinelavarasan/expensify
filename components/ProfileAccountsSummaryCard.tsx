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
      <View style={styles.splitRow}>
        <View style={styles.balanceCol}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.onPrimary }]}>Total Balance</Text>
            {!isBaseBalanceVisible && (
              <TouchableOpacity onPress={() => setPeeked((prev) => !prev)} hitSlop={8}>
                <Feather
                  name={isBalanceVisible ? 'eye' : 'eye-off'}
                  size={12}
                  color={colors.onPrimary}
                />
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.balance, { color: colors.onPrimary }]} numberOfLines={1}>
            {isBalanceVisible
              ? formatToCurrency(animatedBalance, undefined, totalBalance)
              : '••••••'}
          </Text>
        </View>

        <View style={styles.statsCol}>
          <Animated.View
            entering={FadeInDown.duration(550).delay(180).easing(Easing.out(Easing.quad))}
            style={styles.statRow}>
            <View style={[styles.iconSquare, { backgroundColor: colors.onPrimaryStrong }]}>
              <Feather name="credit-card" size={13} color={colors.primary} />
            </View>
            <View style={styles.statText}>
              <Text style={[styles.statLabel, { color: colors.onPrimary }]}>Accounts</Text>
              <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
                {Math.round(animatedAccountsCount)}
              </Text>
            </View>
          </Animated.View>
          {!!primaryAccountName && (
            <Animated.View
              entering={FadeInDown.duration(550).delay(260).easing(Easing.out(Easing.quad))}
              style={styles.statRow}>
              <View style={[styles.iconSquare, { backgroundColor: colors.onPrimaryStrong }]}>
                <Feather name="star" size={13} color={colors.primary} />
              </View>
              <View style={styles.statText}>
                <Text style={[styles.statLabel, { color: colors.onPrimary }]}>Primary</Text>
                <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
                  {primaryAccountName}
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
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
  splitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  balanceCol: {
    flex: 1,
    minWidth: 0,
  },
  statsCol: {
    width: '40%',
    gap: 6,
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
    fontSize: FontSize.xl,
    fontFamily: 'Inter-700',
    marginTop: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    flex: 1,
    minWidth: 0,
  },
  iconSquare: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    opacity: 0.85,
  },
  statValue: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-700',
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
