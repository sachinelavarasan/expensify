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
      <View style={styles.splitRow}>
        <View style={styles.netCol}>
          <Text style={[styles.label, { color: colors.onPrimary }]}>Net Total</Text>
          <Text style={[styles.net, { color: colors.onPrimary }]} numberOfLines={1}>
            {formatToCurrency(animatedNet, undefined, net)}
          </Text>
        </View>

        <View style={styles.statsCol}>
          <View style={styles.statRow}>
            <View style={[styles.iconSquare, { backgroundColor: colors.onPrimaryStrong }]}>
              <Feather name="arrow-down-left" size={13} color={colors.income} />
            </View>
            <View style={styles.statText}>
              <Text style={[styles.statLabel, { color: colors.onPrimary }]}>Income</Text>
              <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
                {formatToCurrency(animatedIncome, undefined, income)}
              </Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={[styles.iconSquare, { backgroundColor: colors.onPrimaryStrong }]}>
              <Feather name="arrow-up-right" size={13} color={colors.expense} />
            </View>
            <View style={styles.statText}>
              <Text style={[styles.statLabel, { color: colors.onPrimary }]}>Expense</Text>
              <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
                {formatToCurrency(animatedExpense, undefined, expense)}
              </Text>
            </View>
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
  splitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  netCol: {
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
  net: {
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
