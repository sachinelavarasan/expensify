import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeContext } from '@/contexts/ThemedContext';
import { formatToCurrency } from '@/utils/formatter';
import { FontSize } from '@/utils/Typography';
import useCountUp from '@/hooks/useCountUp';
import BudgetRing from './BudgetRing';

interface Props {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
}

export default function BudgetSummaryCard({ totalBudget, totalSpent, totalRemaining }: Props) {
  const { colors } = useThemeContext();
  const exceeded = totalRemaining < 0;
  const rawPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const percentage = Math.min(rawPct, 100);

  const animatedTotalBudget = useCountUp(totalBudget);
  const animatedTotalSpent = useCountUp(totalSpent);
  const animatedTotalRemaining = useCountUp(totalRemaining);

  const ringColor = exceeded ? colors.danger : colors.onPrimaryStrong;

  return (
    <View style={[styles.card, { backgroundColor: colors.primary }]}>
      <View style={styles.topRow}>
        <BudgetRing
          size={92}
          strokeWidth={9}
          percentage={rawPct}
          color={ringColor}
          trackColor={colors.onPrimaryBorder}>
          <View style={styles.ringCenter}>
            <Text
              style={[styles.ringPct, { color: colors.onPrimary }]}
              numberOfLines={1}
              adjustsFontSizeToFit>
              {rawPct > 999 ? '999+' : `${Math.round(rawPct)}%`}
            </Text>
            <Text style={[styles.ringCaption, { color: colors.onPrimary }]}>used</Text>
          </View>
        </BudgetRing>

        <View style={styles.figures}>
          <Text style={[styles.label, { color: colors.onPrimary }]}>Total Budget</Text>
          <Text style={[styles.balance, { color: colors.onPrimary }]} numberOfLines={1}>
            {formatToCurrency(animatedTotalBudget, undefined, totalBudget)}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.onPrimaryBorder }]} />

          <View style={styles.statRow}>
            <View style={[styles.dot, { backgroundColor: colors.onPrimaryStrong }]} />
            <Text style={[styles.statLabel, { color: colors.onPrimary }]}>Spent</Text>
            <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
              {formatToCurrency(animatedTotalSpent, undefined, totalSpent)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <View
              style={[
                styles.dot,
                { backgroundColor: exceeded ? colors.danger : colors.onPrimaryStrong },
              ]}
            />
            <Text style={[styles.statLabel, { color: colors.onPrimary }]}>
              {exceeded ? 'Over by' : 'Remaining'}
            </Text>
            <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
              {formatToCurrency(
                Math.abs(animatedTotalRemaining),
                undefined,
                Math.abs(totalRemaining),
              )}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.footNote, { color: colors.onPrimary }]}>
        {exceeded
          ? 'Budget exceeded this month'
          : `${percentage.toFixed(0)}% of this month's budget used`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPct: {
    fontSize: FontSize.lg,
    fontFamily: 'Inter-700',
  },
  ringCaption: {
    fontSize: 9,
    fontFamily: 'Inter-500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.8,
    marginTop: 1,
  },
  figures: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.75,
  },
  balance: {
    fontSize: FontSize.xl,
    fontFamily: 'Inter-700',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    opacity: 0.85,
  },
  statValue: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-700',
  },
  footNote: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    marginTop: 14,
    opacity: 0.9,
  },
});
