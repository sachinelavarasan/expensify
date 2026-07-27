import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

import { IRecurringTransaction } from '@/types';
import { formatToCurrency } from '@/utils/formatter';
import { recurringFrequencyType } from '@/utils/common-data';
import { useThemeContext } from '@/contexts/ThemedContext';
import CustomSwitch from './Switch';

interface Props extends IRecurringTransaction {
  onToggleActive: (id: number, value: boolean) => void;
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

  const frequencyLabel =
    recurringFrequencyType.find((item) => item.id === exp_rt_frequency)?.label || exp_rt_frequency;

  return (
    <TouchableOpacity
      activeOpacity={0.2}
      onPress={() => router.push(`/recurring-transaction?exp_rt_id=${exp_rt_id}`)}
      style={styles.innerContainer}>
      <View style={styles.left}>
        <View
          style={{
            backgroundColor: exp_tc_icon_bg_color ? exp_tc_icon_bg_color : colors.categoryFallbackBg,
            padding: 8,
            borderRadius: 5,
            marginTop: 2,
            alignSelf: 'flex-start',
            opacity: exp_rt_is_active ? 1 : 0.4,
          }}>
          <MaterialIcons
            name={exp_tc_icon as React.ComponentProps<typeof MaterialIcons>['name']}
            size={24}
            color={colors.categoryFallbackIcon}
          />
        </View>
        <View>
          <Text style={[styles.name, { color: colors.title }]} numberOfLines={2}>
            {exp_rt_title}
          </Text>
          <View style={styles.subTextContainer}>
            <Text style={[styles.subText, { fontFamily: 'Inter-500', color: colors.lighterTitle, marginRight: 6 }]}>
              {exp_tc_label}
            </Text>
            <Text style={[styles.subText, { fontFamily: 'Inter-500', color: colors.description }]}>
              <Text>{'•'}</Text> {frequencyLabel}
            </Text>
          </View>
          <Text style={[styles.subText, { color: colors.description, marginTop: 2 }]}>
            Next: {format(parseISO(exp_rt_next_due_date), 'MMM d, yyyy')}
          </Text>
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
    borderRadius: 5,
    paddingVertical: 4,
  },
  name: {
    fontSize: 14,
    fontFamily: 'Inter-600',
  },
  subText: {
    fontSize: 12,
    fontFamily: 'Inter-400',
  },
  subTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
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
    gap: 6,
  },
  amount: {
    fontSize: 12,
    fontFamily: 'Inter-600',
  },
});
