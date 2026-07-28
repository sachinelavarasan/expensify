import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { useRecurringTransactions } from '@/hooks/useRecurringTransaction';
import useBudgetsForMonth from '@/hooks/useBudget';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';

const BUDGET_ALERT_THRESHOLD = 90;

export default function HomeNudges() {
  const { colors } = useThemeContext();
  const router = useRouter();
  const { recurringTransactions } = useRecurringTransactions();
  const { budgets } = useBudgetsForMonth();

  const activeRecurringCount = useMemo(
    () => recurringTransactions.filter((item) => item.exp_rt_is_active).length,
    [recurringTransactions],
  );

  const budgetAlert = useMemo(() => {
    const atRisk = budgets
      .filter((item) => item.exp_bg_id && Number(item.budgetAmount) > 0)
      .map((item) => ({
        category: item.category,
        percentage: (item.totalAmount / Number(item.budgetAmount)) * 100,
      }))
      .filter((item) => item.percentage >= BUDGET_ALERT_THRESHOLD)
      .sort((a, b) => b.percentage - a.percentage);

    return atRisk[0];
  }, [budgets]);

  return (
    <>
      {activeRecurringCount > 0 && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.nudge, { backgroundColor: colors.inputColor, borderColor: colors.inputBorder }]}
          onPress={() => router.push('/import-recurring-transactions')}>
          <View style={[styles.iconBox, { backgroundColor: `${colors.primary}22` }]}>
            <MaterialIcons name="autorenew" size={16} color={colors.primary} />
          </View>
          <Text style={[styles.text, { color: colors.title }]}>
            <Text style={styles.bold}>
              {activeRecurringCount} recurring transaction{activeRecurringCount > 1 ? 's' : ''}
            </Text>{' '}
            ready to import this month
          </Text>
          <MaterialIcons name="chevron-right" size={20} color={colors.lighterTitle} />
        </TouchableOpacity>
      )}

      {!!budgetAlert && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.nudge, { backgroundColor: colors.inputColor, borderColor: colors.inputBorder }]}
          onPress={() => router.push('/dashboard/budget')}>
          <View style={[styles.iconBox, { backgroundColor: `${colors.accent}33` }]}>
            <MaterialIcons name="warning" size={16} color={colors.accent} />
          </View>
          <Text style={[styles.text, { color: colors.title }]}>
            <Text style={[styles.bold, { color: colors.expense }]}>{budgetAlert.category} budget</Text>{' '}
            —{' '}
            {budgetAlert.percentage >= 100
              ? 'exceeded this month'
              : `${budgetAlert.percentage.toFixed(0)}% used this month`}
          </Text>
          <MaterialIcons name="chevron-right" size={20} color={colors.lighterTitle} />
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 11,
    marginTop: 10,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    lineHeight: 17,
  },
  bold: {
    fontFamily: 'Inter-600',
  },
});
