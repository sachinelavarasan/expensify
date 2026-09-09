import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';

import { useThemeContext } from '@/contexts/ThemedContext';
import { formatToCurrency } from '@/utils/formatter';
import { FontSize } from '@/utils/Typography';
import useCountUp from '@/hooks/useCountUp';

interface Props {
  count: number;
  totalIncome: number;
  totalExpense: number;
}

export default function StarredSummaryCard({ count, totalIncome, totalExpense }: Props) {
  const { colors } = useThemeContext();
  const animatedCount = useCountUp(count, 600);
  const animatedIncome = useCountUp(totalIncome);
  const animatedExpense = useCountUp(totalExpense);

  return (
    <View style={[styles.card, { backgroundColor: colors.primary }]}>
      <View style={styles.splitRow}>
        <View style={styles.countCol}>
          <Text style={[styles.label, { color: colors.onPrimary }]}>Starred Transactions</Text>
          <Text style={[styles.count, { color: colors.onPrimary }]} numberOfLines={1}>
            {Math.round(animatedCount)}
          </Text>
        </View>

        <View style={styles.statsCol}>
          <Animated.View
            entering={FadeInDown.duration(550).delay(180).easing(Easing.out(Easing.quad))}
            style={styles.statRow}>
            <View style={[styles.iconSquare, { backgroundColor: colors.onPrimaryStrong }]}>
              <Feather name="arrow-down-left" size={13} color={colors.income} />
            </View>
            <View style={styles.statText}>
              <Text style={[styles.statLabel, { color: colors.onPrimary }]}>Income</Text>
              <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
                {formatToCurrency(animatedIncome, undefined, totalIncome)}
              </Text>
            </View>
          </Animated.View>
          <Animated.View
            entering={FadeInDown.duration(550).delay(260).easing(Easing.out(Easing.quad))}
            style={styles.statRow}>
            <View style={[styles.iconSquare, { backgroundColor: colors.onPrimaryStrong }]}>
              <Feather name="arrow-up-right" size={13} color={colors.expense} />
            </View>
            <View style={styles.statText}>
              <Text style={[styles.statLabel, { color: colors.onPrimary }]}>Expense</Text>
              <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
                {formatToCurrency(animatedExpense, undefined, totalExpense)}
              </Text>
            </View>
          </Animated.View>
        </View>
      </View>

      {count === 0 && (
        <View style={[styles.footer, { borderTopColor: colors.onPrimaryBorder }]}>
          <Text style={[styles.footerText, { color: colors.onPrimary }]}>
            Star a transaction to pin it here for quick access
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
  countCol: {
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
  count: {
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
