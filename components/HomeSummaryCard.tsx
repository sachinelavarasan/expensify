import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, Polygon, Polyline } from 'react-native-svg';

import { Itransaction } from '@/types';
import { useSpendTrend } from '@/hooks/useTransaction';
import { useThemeContext } from '@/contexts/ThemedContext';
import { formatToCurrency } from '@/utils/formatter';
import { FontSize } from '@/utils/Typography';
import useCountUp from '@/hooks/useCountUp';

const SPARKLINE_WIDTH = 96;
const SPARKLINE_HEIGHT = 34;
const SPARKLINE_PADDING = 4;

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
  const { trend } = useSpendTrend(6);

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

  const sparklinePoints = useMemo(() => {
    const values = trend.map((point) => point.income - point.expense);
    if (values.length < 2) {
      return null;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const innerWidth = SPARKLINE_WIDTH - SPARKLINE_PADDING * 2;
    const innerHeight = SPARKLINE_HEIGHT - SPARKLINE_PADDING * 2;
    const stepX = innerWidth / (values.length - 1);

    return values.map((value, index) => ({
      x: SPARKLINE_PADDING + index * stepX,
      y: SPARKLINE_PADDING + innerHeight - ((value - min) / range) * innerHeight,
    }));
  }, [trend]);

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
        <View style={styles.stats}>
          <View style={styles.stat}>
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
          <View style={styles.stat}>
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

        {!!sparklinePoints && (
          <Svg width={SPARKLINE_WIDTH} height={SPARKLINE_HEIGHT}>
            <Polygon
              points={[
                ...sparklinePoints.map((point) => `${point.x},${point.y}`),
                `${SPARKLINE_WIDTH - SPARKLINE_PADDING},${SPARKLINE_HEIGHT}`,
                `${SPARKLINE_PADDING},${SPARKLINE_HEIGHT}`,
              ].join(' ')}
              fill={colors.onPrimarySubtle}
            />
            <Polyline
              points={sparklinePoints.map((point) => `${point.x},${point.y}`).join(' ')}
              fill="none"
              stroke={colors.onPrimaryStrong}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx={sparklinePoints[sparklinePoints.length - 1].x}
              cy={sparklinePoints[sparklinePoints.length - 1].y}
              r={3}
              fill={colors.onPrimary}
            />
          </Svg>
        )}
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
    fontSize: 24,
    fontFamily: 'Inter-600',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 14,
  },
  stats: {
    flexDirection: 'row',
    gap: 24,
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
