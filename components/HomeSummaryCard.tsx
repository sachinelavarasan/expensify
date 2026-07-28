import React, { useMemo } from 'react';
import { ColorValue, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
}

export default function HomeSummaryCard({
  income,
  expense,
  balance,
  showBalance,
  carryBalance,
  transactions,
}: Props) {
  const { colors } = useThemeContext();
  const { trend } = useSpendTrend(6);

  const isBalanceVisible = carryBalance || !showBalance;

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
    const totals = new Map<number, { label: string; amount: number }>();
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
    <LinearGradient
      colors={colors.floatingBtnBg as [ColorValue, ColorValue]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}>
      <Text style={[styles.label, { color: colors.onPrimary }]}>Balance</Text>
      <Text style={[styles.balance, { color: colors.onPrimary }]} numberOfLines={1}>
        {isBalanceVisible ? formatToCurrency(animatedBalance, undefined, balance) : '••••••'}
      </Text>

      <View style={styles.row}>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <View style={styles.dot}>
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
            <View style={styles.dot}>
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
              fill="rgba(255,255,255,0.18)"
            />
            <Polyline
              points={sparklinePoints.map((point) => `${point.x},${point.y}`).join(' ')}
              fill="none"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx={sparklinePoints[sparklinePoints.length - 1].x}
              cy={sparklinePoints[sparklinePoints.length - 1].y}
              r={3}
              fill="#fff"
            />
          </Svg>
        )}
      </View>

      {!!topCategory && (
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.onPrimary }]}>
            Top category:{' '}
            <Text style={styles.footerValue}>
              {topCategory.label} · {formatToCurrency(topCategory.amount)}
            </Text>
          </Text>
        </View>
      )}
    </LinearGradient>
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
  balance: {
    fontSize: 30,
    fontFamily: 'Inter-600',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 14,
  },
  stats: {
    flexDirection: 'row',
    gap: 18,
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
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.22)',
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
