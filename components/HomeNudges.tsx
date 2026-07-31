import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { useRecurringTransactions } from '@/hooks/useRecurringTransaction';
import useBudgetsForMonth from '@/hooks/useBudget';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';
import { getBudgetAlerts } from '@/utils/budgetAlerts';

export default function HomeNudges() {
  const { colors } = useThemeContext();
  const router = useRouter();
  const { recurringTransactions } = useRecurringTransactions();
  const { budgets } = useBudgetsForMonth();

  const activeRecurringCount = useMemo(
    () => recurringTransactions.filter((item) => item.exp_rt_is_active).length,
    [recurringTransactions],
  );

  const budgetAlert = useMemo(() => getBudgetAlerts(budgets)[0], [budgets]);

  if (activeRecurringCount === 0 && !budgetAlert) {
    return null;
  }

  return (
    <>
      <Text style={[styles.sectionLabel, { color: colors.description }]}>Important Actions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {activeRecurringCount > 0 && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.pill,
              { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
            ]}
            onPress={() => router.push('/import-recurring-transactions')}>
            <MaterialIcons name="autorenew" size={14} color={colors.primary} />
            <Text style={[styles.pillText, { color: colors.title }]} numberOfLines={1}>
              Import Recurring ({activeRecurringCount})
            </Text>
          </TouchableOpacity>
        )}

        {!!budgetAlert && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.pill,
              { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
            ]}
            onPress={() => router.push('/dashboard/budget')}>
            <MaterialIcons name="warning-amber" size={14} color={colors.accent} />
            <Text style={[styles.pillText, { color: colors.expense }]} numberOfLines={1}>
              {budgetAlert.category} Budget:{' '}
              {budgetAlert.exceeded ? 'exceeded' : `${budgetAlert.percentage.toFixed(0)}%`}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
  },
});
