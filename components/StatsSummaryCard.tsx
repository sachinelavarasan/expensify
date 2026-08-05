import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useThemeContext } from '@/contexts/ThemedContext';
import { formatToCurrency } from '@/utils/formatter';
import { FontSize } from '@/utils/Typography';
import useCountUp from '@/hooks/useCountUp';

interface Props {
  income: number;
  expense: number;
  transactionCount: number;
}

export default function StatsSummaryCard({ income, expense, transactionCount }: Props) {
  const { colors } = useThemeContext();
  const net = income - expense;

  const animatedNet = useCountUp(net);
  const animatedIncome = useCountUp(income);
  const animatedExpense = useCountUp(expense);

  return (
    <View style={[styles.card, { backgroundColor: colors.primary }]}>
      <Text style={[styles.label, { color: colors.onPrimary }]}>Net Total</Text>
      <Text style={[styles.net, { color: colors.onPrimary }]} numberOfLines={1}>
        {formatToCurrency(animatedNet, undefined, net)}
      </Text>

      <View style={styles.row}>
        <View style={[styles.stat, styles.statPill]}>
          <View style={[styles.dot, { backgroundColor: colors.onPrimarySubtle }]}>
            <Feather name="arrow-down-left" size={11} color={colors.onPrimary} />
          </View>
          <View>
            <Text style={[styles.statLabel, { color: colors.onPrimary }]}>Income</Text>
            <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
              {formatToCurrency(animatedIncome, undefined, income)}
            </Text>
          </View>
        </View>
        <View style={[styles.stat, styles.statPill]}>
          <View style={[styles.dot, { backgroundColor: colors.onPrimarySubtle }]}>
            <Feather name="arrow-up-right" size={11} color={colors.onPrimary} />
          </View>
          <View>
            <Text style={[styles.statLabel, { color: colors.onPrimary }]}>Expense</Text>
            <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
              {formatToCurrency(animatedExpense, undefined, expense)}
            </Text>
          </View>
        </View>
      </View>

      {transactionCount > 0 && (
        <View style={[styles.footer, { borderTopColor: colors.onPrimaryBorder }]}>
          <Text style={[styles.footerText, { color: colors.onPrimary }]}>
            {transactionCount} {transactionCount === 1 ? 'transaction' : 'transactions'} this period
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
  },
  label: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.75,
  },
  net: {
    fontSize: FontSize.display,
    fontFamily: 'Inter-700',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
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
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
    opacity: 0.9,
  },
});
