import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { formatToCurrency } from '@/utils/formatter';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';
import useCountUp from '@/hooks/useCountUp';

type BankCardProps = {
  bankName: string;
  holderName: string;
  balance: number | string;
  onPress?: () => void;
  otherStyle?: StyleProp<ViewStyle>;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  // Optional "All Time" activity for this account. When provided, an income/
  // expense stat row and transaction count are folded into the same card
  // instead of needing a separate summary card.
  income?: number;
  expense?: number;
  transactionCount?: number;
};

const BankCard = ({
  bankName,
  holderName,
  balance,
  icon,
  onPress,
  otherStyle,
  income,
  expense,
  transactionCount,
}: BankCardProps) => {
  const { colors } = useThemeContext();

  const numericBalance = Number(balance) || 0;
  const animatedBalance = useCountUp(numericBalance);
  const showActivity = income !== undefined && expense !== undefined;
  const animatedIncome = useCountUp(income ?? 0);
  const animatedExpense = useCountUp(expense ?? 0);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.card,
        { backgroundColor: colors.inputColor, borderColor: colors.primary },
        otherStyle,
      ]}>
      <View style={styles.topRow}>
        <View style={styles.left}>
          <View style={[styles.dot, { backgroundColor: `${colors.primary}22` }]}>
            <MaterialIcons name={icon} size={16} color={colors.primary} />
          </View>
          <View style={styles.identity}>
            <Text style={[styles.label, { color: colors.lighterTitle }]}>Account</Text>
            <Text style={[styles.value, { color: colors.title }]} numberOfLines={1}>
              {bankName}
            </Text>
          </View>
        </View>

        <View style={styles.right}>
          <Text style={[styles.label, { color: colors.lighterTitle }]}>Balance</Text>
          <Text style={[styles.balance, { color: colors.title }]} numberOfLines={1}>
            {formatToCurrency(animatedBalance, undefined, numericBalance)}
          </Text>
        </View>
      </View>

      {showActivity && (
        <View style={[styles.activityRow, { borderTopColor: colors.borderColor }]}>
          <View style={styles.stat}>
            <View style={[styles.statDot, { backgroundColor: `${colors.income}22` }]}>
              <Feather name="arrow-down-left" size={11} color={colors.income} />
            </View>
            <View>
              <Text style={[styles.statLabel, { color: colors.lighterTitle }]}>Income</Text>
              <Text style={[styles.statValue, { color: colors.title }]} numberOfLines={1}>
                {formatToCurrency(animatedIncome, undefined, income)}
              </Text>
            </View>
          </View>
          <View style={styles.stat}>
            <View style={[styles.statDot, { backgroundColor: `${colors.expense}22` }]}>
              <Feather name="arrow-up-right" size={11} color={colors.expense} />
            </View>
            <View>
              <Text style={[styles.statLabel, { color: colors.lighterTitle }]}>Expense</Text>
              <Text style={[styles.statValue, { color: colors.title }]} numberOfLines={1}>
                {formatToCurrency(animatedExpense, undefined, expense)}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={[styles.footer, { borderTopColor: colors.borderColor }]}>
        <Text style={[styles.footerText, { color: colors.description }]} numberOfLines={1}>
          Card Holder: <Text style={[styles.footerValue, { color: colors.title }]}>{holderName}</Text>
          {!!transactionCount && (
            <Text style={[styles.footerText, { color: colors.description }]}>
              {'  ·  '}
              <Text style={[styles.footerValue, { color: colors.title }]}>{transactionCount}</Text>
              {transactionCount === 1 ? ' transaction' : ' transactions'}
            </Text>
          )}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default BankCard;

const styles = StyleSheet.create({
  card: {
    width: 350,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  identity: {
    flexShrink: 1,
  },
  right: {
    alignItems: 'flex-end',
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.xs,
    fontFamily: 'Inter-600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  value: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-700',
    marginTop: 2,
  },
  balance: {
    fontSize: FontSize.xl,
    fontFamily: 'Inter-700',
    marginTop: 2,
  },
  activityRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statDot: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontFamily: 'Inter-600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-700',
    marginTop: 1,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
  },
  footerValue: {
    fontFamily: 'Inter-600',
  },
});
