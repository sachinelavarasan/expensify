import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useThemeContext } from '@/contexts/ThemedContext';
import { formatToCurrency } from '@/utils/formatter';
import { FontSize } from '@/utils/Typography';
import useCountUp from '@/hooks/useCountUp';

interface Props {
  monthlyOutflow: number;
  monthlyIncome: number;
  nextTitle?: string;
  nextDaysUntil?: number;
  label?: string;
}

export default function RecurringSummaryCard({
  monthlyOutflow,
  monthlyIncome,
  nextTitle,
  nextDaysUntil,
  label = 'Monthly Recurring',
}: Props) {
  const { colors } = useThemeContext();
  const animatedOutflow = useCountUp(monthlyOutflow);
  const animatedIncome = useCountUp(monthlyIncome);

  return (
    <View style={[styles.card, { backgroundColor: colors.primary }]}>
      <View style={styles.splitRow}>
        <View style={styles.amountCol}>
          <Text style={[styles.label, { color: colors.onPrimary }]}>{label}</Text>
          <Text style={[styles.amount, { color: colors.onPrimary }]} numberOfLines={1}>
            {formatToCurrency(animatedOutflow, undefined, monthlyOutflow)}
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
                {formatToCurrency(animatedIncome, undefined, monthlyIncome)}
              </Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={[styles.iconSquare, { backgroundColor: colors.onPrimaryStrong }]}>
              <Feather name="arrow-up-right" size={13} color={colors.expense} />
            </View>
            <View style={styles.statText}>
              <Text style={[styles.statLabel, { color: colors.onPrimary }]}>Outflow</Text>
              <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
                {formatToCurrency(animatedOutflow, undefined, monthlyOutflow)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {!!nextTitle && nextDaysUntil !== undefined && (
        <View style={[styles.footer, { borderTopColor: colors.onPrimaryBorder }]}>
          <Feather name="clock" size={12} color={colors.onPrimary} />
          <Text style={[styles.footerText, { color: colors.onPrimary }]} numberOfLines={1}>
            Next: <Text style={styles.footerValue}>{nextTitle}</Text> in {nextDaysUntil} day
            {nextDaysUntil === 1 ? '' : 's'}
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
  amountCol: {
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
  amount: {
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
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    opacity: 0.9,
    flexShrink: 1,
  },
  footerValue: {
    fontFamily: 'Inter-700',
  },
});
