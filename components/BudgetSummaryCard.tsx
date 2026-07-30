import React from 'react';
import { ColorValue, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    <LinearGradient
      colors={colors.floatingBtnBg as [ColorValue, ColorValue]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}>
      <Text style={[styles.label, { color: colors.onPrimary }]}>Total Budget</Text>
      <Text style={[styles.balance, { color: colors.onPrimary }]} numberOfLines={1}>
        {formatToCurrency(animatedTotalBudget, undefined, totalBudget)}
      </Text>

      <View style={styles.row}>
        <View style={styles.stat}>
          <View style={styles.dot}>
            <Feather name="arrow-up-right" size={11} color={colors.onPrimary} />
          </View>
          <View>
            <Text style={[styles.statLabel, { color: colors.onPrimary }]}>Spent</Text>
            <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
              {formatToCurrency(animatedTotalSpent, undefined, totalSpent)}
            </Text>
          </View>
        </View>
        <View style={styles.stat}>
          <View style={styles.dot}>
            <Feather
              name={exceeded ? 'alert-triangle' : 'arrow-down-left'}
              size={11}
              color={colors.onPrimary}
            />
          </View>
          <View>
            <Text style={[styles.statLabel, { color: colors.onPrimary }]}>
              {exceeded ? 'Over by' : 'Remaining'}
            </Text>
            <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
              {formatToCurrency(Math.abs(animatedTotalRemaining), undefined, Math.abs(totalRemaining))}
            </Text>
          </View>
        </View>
      </View>

      <ProgressBar
        percentage={percentage}
        height={8}
        fillColor={exceeded ? colors.danger : 'rgba(255,255,255,0.95)'}
        trackColor="rgba(255,255,255,0.22)"
        style={styles.progressTrack}
      />
      <Text style={[styles.progressLabel, { color: colors.onPrimary }]}>
        {exceeded ? 'Budget exceeded this month' : `${percentage.toFixed(0)}% used this month`}
      </Text>
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
    gap: 18,
    marginTop: 10,
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
  progressTrack: {
    marginTop: 10,
  },
  progressLabel: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    marginTop: 6,
    opacity: 0.9,
  },
});
