import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useThemeContext } from '@/contexts/ThemedContext';
import { formatToCurrency } from '@/utils/formatter';
import { FontSize } from '@/utils/Typography';
import useCountUp from '@/hooks/useCountUp';
import ProgressBar from './ProgressBar';

interface Props {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
}

export default function BudgetSummaryCard({ totalBudget, totalSpent, totalRemaining }: Props) {
  const { colors } = useThemeContext();
  const exceeded = totalRemaining < 0;
  const percentage = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const animatedTotalBudget = useCountUp(totalBudget);
  const animatedTotalSpent = useCountUp(totalSpent);
  const animatedTotalRemaining = useCountUp(totalRemaining);

  return (
    <View style={[styles.card, { backgroundColor: colors.primary }]}>
      <View style={styles.splitRow}>
        <View style={styles.budgetCol}>
          <Text style={[styles.label, { color: colors.onPrimary }]}>Total Budget</Text>
          <Text style={[styles.balance, { color: colors.onPrimary }]} numberOfLines={1}>
            {formatToCurrency(animatedTotalBudget, undefined, totalBudget)}
          </Text>
        </View>

        <View style={styles.statsCol}>
          <View style={styles.statRow}>
            <View style={[styles.iconSquare, { backgroundColor: colors.onPrimaryStrong }]}>
              <Feather name="arrow-up-right" size={13} color={colors.expense} />
            </View>
            <View style={styles.statText}>
              <Text style={[styles.statLabel, { color: colors.onPrimary }]}>Spent</Text>
              <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
                {formatToCurrency(animatedTotalSpent, undefined, totalSpent)}
              </Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={[styles.iconSquare, { backgroundColor: colors.onPrimaryStrong }]}>
              <Feather
                name={exceeded ? 'alert-triangle' : 'arrow-down-left'}
                size={13}
                color={exceeded ? colors.danger : colors.income}
              />
            </View>
            <View style={styles.statText}>
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
      </View>

      <ProgressBar
        percentage={percentage}
        height={8}
        fillColor={exceeded ? colors.danger : colors.onPrimaryStrong}
        trackColor={colors.onPrimaryBorder}
        style={styles.progressTrack}
      />
      <Text style={[styles.progressLabel, { color: colors.onPrimary }]}>
        {exceeded ? 'Budget exceeded this month' : `${percentage.toFixed(0)}% used this month`}
      </Text>
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
  budgetCol: {
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
  progressTrack: {
    marginTop: 14,
  },
  progressLabel: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    marginTop: 6,
    opacity: 0.9,
  },
});
