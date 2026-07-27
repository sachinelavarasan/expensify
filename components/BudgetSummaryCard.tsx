import React, { useEffect } from 'react';
import { ColorValue, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useThemeContext } from '@/contexts/ThemedContext';
import { formatToCurrency } from '@/utils/formatter';
import { FontSize } from '@/utils/Typography';
import useCountUp from '@/hooks/useCountUp';

interface Props {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
}

export default function BudgetSummaryCard({ totalBudget, totalSpent, totalRemaining }: Props) {
  const { colors } = useThemeContext();
  const exceeded = totalRemaining < 0;
  const percentage = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(percentage, { duration: 800 });
  }, [percentage, progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

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

      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: exceeded ? colors.danger : 'rgba(255,255,255,0.95)' },
            progressStyle,
          ]}
        />
      </View>
      <Text style={[styles.progressLabel, { color: colors.onPrimary }]}>
        {exceeded ? 'Budget exceeded this month' : `${percentage.toFixed(0)}% used this month`}
      </Text>
    </LinearGradient>
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
  balance: {
    fontSize: 30,
    fontFamily: 'Inter-600',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 16,
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
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    marginTop: 8,
    opacity: 0.9,
  },
});
