import React from 'react';
import { ColorValue, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
}

export default function ProfileAccountsSummaryCard({
  totalBalance,
  accountsCount,
  primaryAccountName,
}: Props) {
  const { colors } = useThemeContext();
  const animatedBalance = useCountUp(totalBalance);
  const animatedAccountsCount = useCountUp(accountsCount, 600);

  return (
    <LinearGradient
      colors={colors.floatingBtnBg as [ColorValue, ColorValue]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}>
      <Text style={[styles.label, { color: colors.onPrimary }]}>Total Balance</Text>
      <Text style={[styles.balance, { color: colors.onPrimary }]} numberOfLines={1}>
        {formatToCurrency(animatedBalance, undefined, totalBalance)}
      </Text>

      <View style={styles.row}>
        <Animated.View
          entering={FadeInDown.duration(550).delay(180).easing(Easing.out(Easing.quad))}
          style={styles.stat}>
          <View style={styles.dot}>
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
            style={styles.stat}>
            <View style={styles.dot}>
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
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.onPrimary }]}>
            Add your first account to get started
          </Text>
        </View>
      )}
    </LinearGradient>
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
  balance: {
    fontSize: 24,
    fontFamily: 'Inter-600',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter-600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    opacity: 0.75,
  },
  statValue: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    marginTop: 1,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.22)',
  },
  footerText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
    opacity: 0.9,
  },
});
