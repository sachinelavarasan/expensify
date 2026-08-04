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
      <Text style={[styles.label, { color: colors.onPrimary }]}>Starred Transactions</Text>
      <Text style={[styles.count, { color: colors.onPrimary }]} numberOfLines={1}>
        {Math.round(animatedCount)}
      </Text>

      <View style={styles.row}>
        <Animated.View
          entering={FadeInDown.duration(550).delay(180).easing(Easing.out(Easing.quad))}
          style={styles.stat}>
          <View style={[styles.dot, { backgroundColor: colors.onPrimarySubtle }]}>
            <Feather name="arrow-down-left" size={11} color={colors.onPrimary} />
          </View>
          <View>
            <Text style={[styles.statLabel, { color: colors.onPrimary }]}>Income</Text>
            <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
              {formatToCurrency(animatedIncome, undefined, totalIncome)}
            </Text>
          </View>
        </Animated.View>
        <Animated.View
          entering={FadeInDown.duration(550).delay(260).easing(Easing.out(Easing.quad))}
          style={styles.stat}>
          <View style={[styles.dot, { backgroundColor: colors.onPrimarySubtle }]}>
            <Feather name="arrow-up-right" size={11} color={colors.onPrimary} />
          </View>
          <View>
            <Text style={[styles.statLabel, { color: colors.onPrimary }]}>Expense</Text>
            <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
              {formatToCurrency(animatedExpense, undefined, totalExpense)}
            </Text>
          </View>
        </Animated.View>
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
  label: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.75,
  },
  count: {
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
  },
  footerText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
    opacity: 0.9,
  },
});
