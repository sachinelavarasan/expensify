import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

import { IRecurringTransaction } from '@/types';
import { formatToCurrency } from '@/utils/formatter';
import { recurringFrequencyType } from '@/utils/common-data';
import { useThemeContext } from '@/contexts/ThemedContext';
import { RECURRING_DUE_SOON_DAYS, getDaysUntilDue } from '@/utils/recurringAlerts';
import CustomSwitch from './Switch';

interface Props extends IRecurringTransaction {
  onToggleActive: (id: string, value: boolean) => void;
}

const RecurringTransactionCard = ({
  exp_rt_id,
  exp_rt_title,
  exp_rt_amount,
  exp_rt_transaction_type_id,
  exp_rt_frequency,
  exp_rt_next_due_date,
  exp_rt_is_active,
  exp_tc_icon,
  exp_tc_icon_bg_color,
  exp_tc_label,
  onToggleActive,
}: Props) => {
  const { colors } = useThemeContext();
  const router = useRouter();
  const iconColor = exp_tc_icon_bg_color || colors.categoryFallbackIcon;

  const frequencyLabel =
    recurringFrequencyType.find((item) => item.id === exp_rt_frequency)?.label || exp_rt_frequency;

  const daysUntil = getDaysUntilDue(exp_rt_next_due_date);
  const isDueSoon = exp_rt_is_active && daysUntil <= RECURRING_DUE_SOON_DAYS;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/recurring-transaction?exp_rt_id=${exp_rt_id}`)}
      style={[
        styles.innerContainer,
        { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
        !exp_rt_is_active && styles.paused,
      ]}>
      <View style={styles.left}>
        <View
          style={{
            backgroundColor: `${iconColor}2E`,
            padding: 8,
            borderRadius: 10,
            alignSelf: 'flex-start',
          }}>
          <MaterialIcons
            name={exp_tc_icon as React.ComponentProps<typeof MaterialIcons>['name']}
            size={20}
            color={iconColor}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.title }]} numberOfLines={1}>
            {exp_rt_title}
          </Text>
          <Text style={[styles.subText, { color: colors.lighterTitle, marginTop: 2 }]} numberOfLines={1}>
            {exp_tc_label} · {frequencyLabel}
          </Text>
          {!exp_rt_is_active ? (
            <View style={[styles.chip, { backgroundColor: colors.inputColor }]}>
              <Text style={[styles.chipText, { color: colors.lighterTitle }]}>Paused</Text>
            </View>
          ) : isDueSoon ? (
            <View style={[styles.chip, { backgroundColor: `${colors.accent}29` }]}>
              <Text style={[styles.chipText, { color: colors.accent }]}>
                Due in {daysUntil} day{daysUntil === 1 ? '' : 's'}
              </Text>
            </View>
          ) : (
            <Text style={[styles.subText, { color: colors.lighterTitle, marginTop: 5 }]}>
              {format(parseISO(exp_rt_next_due_date), 'MMM d, yyyy')}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.right}>
        <Text
          style={[
            styles.amount,
            { color: exp_rt_transaction_type_id === 2 ? colors.income : colors.expense },
          ]}>
          {exp_rt_transaction_type_id === 2 ? '+' : '-'}
          {formatToCurrency(exp_rt_amount)}
        </Text>
        <CustomSwitch
          value={exp_rt_is_active}
          onChange={(value) => onToggleActive(exp_rt_id, value)}
        />
      </View>
    </TouchableOpacity>
  );
};

export default RecurringTransactionCard;

const styles = StyleSheet.create({
  innerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  paused: {
    opacity: 0.55,
  },
  name: {
    fontSize: 13.5,
    fontFamily: 'Inter-600',
  },
  subText: {
    fontSize: 11,
    fontFamily: 'Inter-400',
  },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 5,
  },
  chipText: {
    fontSize: 10,
    fontFamily: 'Inter-700',
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  right: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 7,
  },
  amount: {
    fontSize: 14,
    fontFamily: 'Inter-700',
  },
});
