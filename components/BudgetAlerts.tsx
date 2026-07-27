import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useThemeContext } from '@/contexts/ThemedContext';
import { IBudget } from '@/types';
import { FontSize } from '@/utils/Typography';

const BUDGET_ALERT_THRESHOLD = 90;

export default function BudgetAlerts({ budgetedCategories }: { budgetedCategories: IBudget[] }) {
  const { colors } = useThemeContext();

  const alerts = useMemo(
    () =>
      budgetedCategories
        .filter((item) => item.exp_bg_id && Number(item.budgetAmount) > 0)
        .map((item) => ({
          category: item.category,
          percentage: (item.totalAmount / Number(item.budgetAmount)) * 100,
        }))
        .filter((item) => item.percentage >= BUDGET_ALERT_THRESHOLD)
        .sort((a, b) => b.percentage - a.percentage),
    [budgetedCategories],
  );

  if (alerts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {alerts.map((alert) => {
        const exceeded = alert.percentage >= 100;
        return (
          <View
            key={alert.category}
            style={[
              styles.alert,
              {
                backgroundColor: exceeded ? `${colors.expense}1A` : `${colors.accent}1A`,
                borderColor: exceeded ? `${colors.expense}55` : `${colors.accent}55`,
              },
            ]}>
            <MaterialIcons
              name={exceeded ? 'error-outline' : 'warning-amber'}
              size={16}
              color={exceeded ? colors.expense : colors.accent}
            />
            <Text style={[styles.text, { color: colors.title }]}>
              <Text style={styles.bold}>{alert.category}</Text>{' '}
              {exceeded ? 'has exceeded its budget' : `is at ${alert.percentage.toFixed(0)}% of budget`}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 11,
  },
  text: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
    lineHeight: 17,
  },
  bold: {
    fontFamily: 'Inter-600',
  },
});
