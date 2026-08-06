import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Itransaction } from '@/types';
import { useThemeContext } from '@/contexts/ThemedContext';
import { formatToCurrency } from '@/utils/formatter';
import { FontSize } from '@/utils/Typography';
import useCountUp from '@/hooks/useCountUp';

interface Props {
  income: number;
  expense: number;
  balance: number;
  showBalance: boolean;
  carryBalance: boolean;
  transactions: Itransaction[];
  netWorth: number;
  showNetWorth: boolean;
}

export default function HomeSummaryCard({
  income,
  expense,
  balance,
  showBalance,
  carryBalance,
  transactions,
  netWorth,
  showNetWorth,
}: Props) {
  const { colors } = useThemeContext();

  // "base" reflects the persisted setting; a peek toggle can temporarily
  // override it for this render only - it resets next time the card mounts.
  const [balancePeeked, setBalancePeeked] = useState(false);
  const [netWorthPeeked, setNetWorthPeeked] = useState(false);

  const isBaseBalanceVisible = carryBalance || !showBalance;
  const isBalanceVisible = isBaseBalanceVisible || balancePeeked;

  const isBaseNetWorthVisible = !showBalance;
  const isNetWorthVisible = isBaseNetWorthVisible || netWorthPeeked;

  const animatedBalance = useCountUp(balance);
  const animatedIncome = useCountUp(income);
  const animatedExpense = useCountUp(expense);

  const topCategory = useMemo(() => {
    const totals = new Map<string, { label: string; amount: number }>();
    transactions
      .filter((tx) => tx.exp_tt_id === 1)
      .forEach((tx) => {
        const existing = totals.get(tx.exp_tc_id);
        const amount = Number(tx.exp_ts_amount) || 0;
        if (existing) {
          existing.amount += amount;
        } else {
          totals.set(tx.exp_tc_id, { label: tx.exp_ts_category, amount });
        }
      });
    return Array.from(totals.values()).sort((a, b) => b.amount - a.amount)[0];
  }, [transactions]);

  return (
    <View style={[styles.card, { backgroundColor: colors.primary }]}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.onPrimary }]}>Balance</Text>
        {!isBaseBalanceVisible && (
          <TouchableOpacity
            onPress={() => setBalancePeeked((prev) => !prev)}
            hitSlop={8}>
            <Feather
              name={isBalanceVisible ? 'eye' : 'eye-off'}
              size={13}
              color={colors.onPrimary}
            />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.balance, { color: colors.onPrimary }]} numberOfLines={1}>
        {isBalanceVisible ? formatToCurrency(animatedBalance, undefined, balance) : '••••••'}
      </Text>

      <View style={styles.row}>
        <View style={[styles.stat, styles.statPill]}>
          <View style={[styles.dot, { backgroundColor: colors.onPrimarySubtle }]}>
            <Feather name="arrow-down-left" size={11} color={colors.onPrimary} />
          </View>
          <View style={styles.statText}>
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
          <View style={styles.statText}>
            <Text style={[styles.statLabel, { color: colors.onPrimary }]}>Expense</Text>
            <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
              {formatToCurrency(animatedExpense, undefined, expense)}
            </Text>
          </View>
        </View>
      </View>

      {showNetWorth && (
        <View style={[styles.footer, styles.footerRow, { borderTopColor: colors.onPrimaryBorder }]}>
          <View style={styles.netWorthRow}>
            <Text style={[styles.footerText, { color: colors.onPrimary }]} numberOfLines={1}>
              Net worth:{' '}
              <Text style={styles.footerValue}>
                {isNetWorthVisible ? formatToCurrency(netWorth) : '••••••'}
              </Text>
            </Text>
            {!isBaseNetWorthVisible && (
              <TouchableOpacity
                onPress={() => setNetWorthPeeked((prev) => !prev)}
                hitSlop={8}>
                <Feather
                  name={isNetWorthVisible ? 'eye' : 'eye-off'}
                  size={12}
                  color={colors.onPrimary}
                />
              </TouchableOpacity>
            )}
          </View>
          {!!topCategory && (
            <Text
              style={[styles.footerText, { color: colors.onPrimary, flexShrink: 1 }]}
              numberOfLines={1}>
              Top: <Text style={styles.footerValue}>{topCategory.label}</Text>
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
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
  netWorthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  balance: {
    fontSize: FontSize.display,
    fontFamily: 'Inter-700',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  statPill: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 11,
    padding: 8,
  },
  statText: {
    flexShrink: 1,
    minWidth: 0,
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
  footerRow: {
    justifyContent: 'space-between',
    gap: 10,
  },
  footerText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
    opacity: 0.9,
  },
  footerValue: {
    fontFamily: 'Inter-600',
  },
});
