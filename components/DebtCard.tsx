import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

import { useThemeContext } from '@/contexts/ThemedContext';
import { formatToCurrency } from '@/utils/formatter';
import { FontSize } from '@/utils/Typography';
import { IDebt } from '@/types';
import ProgressBar from './ProgressBar';

interface Props {
  debt: IDebt;
  onPress: () => void;
}

export default function DebtCard({ debt, onPress }: Props) {
  const { colors } = useThemeContext();
  const total = Number(debt.exp_dt_amount);
  const repaid = Number(debt.repaid_amount) || 0;
  const remaining = Math.max(total - repaid, 0);
  const isSettled = remaining <= 0;
  const owedToMe = debt.exp_dt_direction === 'owed_to_me';
  const percentage = total > 0 ? (repaid / total) * 100 : 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.inputColor, borderColor: colors.inputBorder }]}
      onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.left}>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: owedToMe ? `${colors.income}1A` : `${colors.expense}1A` },
            ]}>
            <Feather
              name={owedToMe ? 'arrow-down-left' : 'arrow-up-right'}
              size={16}
              color={owedToMe ? colors.income : colors.expense}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.title }]} numberOfLines={1}>
              {debt.exp_dt_person_name}
            </Text>
            <Text style={[styles.subText, { color: colors.description }]}>
              {owedToMe ? 'Owes you' : 'You owe'}
              {!!debt.exp_dt_due_date &&
                ` • Due ${format(parseISO(debt.exp_dt_due_date), 'do MMM yyyy')}`}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.amount, { color: colors.title }]}>
            {formatToCurrency(remaining)}
          </Text>
          {isSettled ? (
            <Text style={[styles.settledLabel, { color: colors.income }]}>Settled</Text>
          ) : (
            <Text style={[styles.subText, { color: colors.description }]}>
              of {formatToCurrency(total)}
            </Text>
          )}
        </View>
      </View>
      {!isSettled && (
        <ProgressBar
          percentage={percentage}
          height={6}
          fillColor={colors.primary}
          style={styles.progress}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-600',
  },
  subText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    marginTop: 2,
  },
  amount: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-700',
  },
  settledLabel: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    marginTop: 2,
  },
  progress: {
    marginTop: 10,
  },
});
