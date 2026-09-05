import React, { useState } from 'react';
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
  // Mirrors the "Hide Balance" setting - true means the balance should be masked.
  showBalance?: boolean;
  isPrimary?: boolean;
  // 'compact' (default) is the neutral card used in horizontal account lists
  // (e.g. Profile) where several cards sit side by side - a flat colored fill
  // repeated across all of them would be too loud. 'ratio' is a neutral card
  // with an income-vs-expense proportion bar under the balance, meant for a
  // single full-width card (the account detail screen).
  variant?: 'compact' | 'ratio';
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
  showBalance,
  isPrimary,
  variant = 'compact',
}: BankCardProps) => {
  const { colors } = useThemeContext();

  const numericBalance = Number(balance) || 0;
  const animatedBalance = useCountUp(numericBalance);

  // "base" reflects the persisted setting; a peek toggle can temporarily
  // override it for this render only - it resets next time the card mounts.
  const [peeked, setPeeked] = useState(false);
  const isBaseBalanceVisible = !showBalance;
  const isBalanceVisible = isBaseBalanceVisible || peeked;

  const showActivity = income !== undefined && expense !== undefined;
  const animatedIncome = useCountUp(income ?? 0);
  const animatedExpense = useCountUp(expense ?? 0);

  const balanceText = isBalanceVisible
    ? formatToCurrency(animatedBalance, undefined, numericBalance)
    : '••••••';

  if (variant === 'ratio') {
    const activityTotal = (income ?? 0) + (expense ?? 0);
    const incomePct = activityTotal > 0 ? (income! / activityTotal) * 100 : 0;
    const expensePct = 100 - incomePct;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        disabled={!onPress}
        style={[
          styles.ratioCard,
          { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
          otherStyle,
        ]}>
        <View style={styles.idRow}>
          <View style={styles.left}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]}>
              <MaterialIcons name={icon} size={16} color={colors.onPrimary} />
            </View>
            <View style={styles.identity}>
              <Text style={[styles.label, { color: colors.lighterTitle }]}>Account</Text>
              <Text style={[styles.value, { color: colors.title }]} numberOfLines={1}>
                {bankName}
              </Text>
              {isPrimary && (
                <View
                  style={[
                    styles.primaryBadge,
                    { backgroundColor: `${colors.primary}1A`, marginTop: 4 },
                  ]}>
                  <Feather name="star" size={10} color={colors.primary} />
                  <Text style={[styles.primaryBadgeText, { color: colors.primary }]}>Primary</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.right}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.lighterTitle }]}>Balance</Text>
              {!isBaseBalanceVisible && (
                <TouchableOpacity onPress={() => setPeeked((prev) => !prev)} hitSlop={8}>
                  <Feather
                    name={isBalanceVisible ? 'eye' : 'eye-off'}
                    size={12}
                    color={colors.lighterTitle}
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.balance, { color: colors.title }]} numberOfLines={1}>
              {balanceText}
            </Text>
          </View>
        </View>

        {showActivity && (
          <>
            <View style={[styles.ratioTrack, { backgroundColor: colors.barBackground }]}>
              <View style={{ flex: Math.max(incomePct, 0.001), backgroundColor: colors.income }} />
              <View
                style={{ flex: Math.max(expensePct, 0.001), backgroundColor: colors.expense }}
              />
            </View>
            <View style={styles.ratioLabels}>
              <View style={styles.ratioStat}>
                <View style={[styles.ratioIconSquare, { backgroundColor: `${colors.income}1A` }]}>
                  <Feather name="arrow-down-left" size={13} color={colors.income} />
                </View>
                <View style={styles.ratioStatText}>
                  <Text style={[styles.ratioText, { color: colors.description }]}>Income</Text>
                  <Text style={[styles.ratioValue, { color: colors.title }]} numberOfLines={1}>
                    {formatToCurrency(animatedIncome, undefined, income)}
                  </Text>
                </View>
              </View>
              <View style={styles.ratioStat}>
                <View style={[styles.ratioIconSquare, { backgroundColor: `${colors.expense}1A` }]}>
                  <Feather name="arrow-up-right" size={13} color={colors.expense} />
                </View>
                <View style={styles.ratioStatText}>
                  <Text style={[styles.ratioText, { color: colors.description }]}>Expense</Text>
                  <Text style={[styles.ratioValue, { color: colors.title }]} numberOfLines={1}>
                    {formatToCurrency(animatedExpense, undefined, expense)}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        <View style={[styles.footer, { borderTopColor: colors.borderColor }]}>
          <Text style={[styles.footerText, { color: colors.description }]} numberOfLines={1}>
            Card Holder:{' '}
            <Text style={[styles.footerValue, { color: colors.title }]}>{holderName}</Text>
            {!!transactionCount && (
              <Text style={[styles.footerText, { color: colors.description }]}>
                {'  ·  '}
                <Text style={[styles.footerValue, { color: colors.title }]}>
                  {transactionCount}
                </Text>
                {transactionCount === 1 ? ' transaction' : ' transactions'}
              </Text>
            )}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.card,
        { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
        otherStyle,
      ]}>
      <View style={styles.topRow}>
        <View style={styles.left}>
          <View style={[styles.dot, { backgroundColor: `${colors.primary}22` }]}>
            <MaterialIcons name={icon} size={16} color={colors.primary} />
          </View>
          <View style={styles.identity}>
            <Text style={[styles.label, { color: colors.lighterTitle }]}>Account</Text>
            <View style={styles.nameRow}>
              <Text
                style={[styles.value, { color: colors.title, flexShrink: 1 }]}
                numberOfLines={1}>
                {bankName}
              </Text>
              {isPrimary && (
                <View style={[styles.primaryBadge, { backgroundColor: `${colors.primary}1A` }]}>
                  <Feather name="star" size={10} color={colors.primary} />
                  <Text style={[styles.primaryBadgeText, { color: colors.primary }]}>Primary</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.right}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.lighterTitle }]}>Balance</Text>
            {!isBaseBalanceVisible && (
              <TouchableOpacity onPress={() => setPeeked((prev) => !prev)} hitSlop={8}>
                <Feather
                  name={isBalanceVisible ? 'eye' : 'eye-off'}
                  size={12}
                  color={colors.lighterTitle}
                />
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.balance, { color: colors.title }]} numberOfLines={1}>
            {balanceText}
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
          Card Holder:{' '}
          <Text style={[styles.footerValue, { color: colors.title }]}>{holderName}</Text>
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
    borderWidth: 1,
    padding: 18,
  },
  ratioCard: {
    width: 350,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-600',
  },
  right: {
    alignItems: 'flex-end',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
  ratioTrack: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  ratioLabels: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  ratioStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  ratioIconSquare: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratioStatText: {
    flex: 1,
    minWidth: 0,
  },
  ratioText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    opacity: 0.85,
  },
  ratioValue: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-700',
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
    opacity: 0.8,
  },
  statValue: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-700',
    marginTop: 1,
  },
  footer: {
    flexDirection: 'row',
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
