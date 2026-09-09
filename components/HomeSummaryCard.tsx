import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  addMonths,
  addWeeks,
  format,
  isSameDay,
  isSameMonth,
  isSameWeek,
  isTomorrow,
  isYesterday,
  subMonths,
  subWeeks,
} from 'date-fns';

import { Itransaction } from '@/types';
import { useThemeContext } from '@/contexts/ThemedContext';
import { formatToCurrency } from '@/utils/formatter';
import { FontSize } from '@/utils/Typography';
import useCountUp from '@/hooks/useCountUp';
import MonthSwitcher from '@/components/MonthSwitch';

type DateRangeType = 'daily' | 'weekly' | 'monthly';

const DARK_STRIP_BG = '#2b3ea1';

interface Props {
  income: number;
  expense: number;
  balance: number;
  showBalance: boolean;
  carryBalance: boolean;
  transactions: Itransaction[];
  netWorth: number;
  showNetWorth: boolean;
  nextMonth: () => void;
  prevMonth: () => void;
  currentMonth: string;
  currentDate?: Date;
  dateRangeType?: DateRangeType;
  onSelectDate?: (date: Date) => void;
  switcherDisabled?: boolean;
}

export default function HomeSummaryCard({
  income,
  expense,
  balance,
  showBalance,
  carryBalance,
  transactions,
  netWorth,
  showNetWorth,
  nextMonth,
  prevMonth,
  currentMonth,
  currentDate,
  dateRangeType,
  onSelectDate,
  switcherDisabled,
}: Props) {
  const { colors, theme } = useThemeContext();

  const periodLabel = useMemo(() => {
    const now = new Date();
    if (!currentDate) {
      return dateRangeType === 'daily' ? 'Day' : dateRangeType === 'weekly' ? 'Week' : 'Month';
    }
    if (dateRangeType === 'daily') {
      if (isSameDay(currentDate, now)) return 'Today';
      if (isYesterday(currentDate)) return 'Yesterday';
      if (isTomorrow(currentDate)) return 'Tomorrow';
      return format(currentDate, 'MMM d');
    }
    if (dateRangeType === 'weekly') {
      if (isSameWeek(currentDate, now, { weekStartsOn: 1 })) return 'This Week';
      if (isSameWeek(currentDate, subWeeks(now, 1), { weekStartsOn: 1 })) return 'Last Week';
      if (isSameWeek(currentDate, addWeeks(now, 1), { weekStartsOn: 1 })) return 'Next Week';
      return 'Week';
    }
    if (isSameMonth(currentDate, now)) return 'This Month';
    if (isSameMonth(currentDate, subMonths(now, 1))) return 'Last Month';
    if (isSameMonth(currentDate, addMonths(now, 1))) return 'Next Month';
    return 'Month';
  }, [currentDate, dateRangeType]);

  const [balancePeeked, setBalancePeeked] = useState(false);
  const [netWorthPeeked, setNetWorthPeeked] = useState(false);

  const isBaseBalanceVisible = carryBalance || !showBalance;
  const isBalanceVisible = isBaseBalanceVisible || balancePeeked;

  const isBaseNetWorthVisible = !showBalance;
  const isNetWorthVisible = isBaseNetWorthVisible || netWorthPeeked;

  const animatedBalance = useCountUp(balance);
  const animatedIncome = useCountUp(income);
  const animatedExpense = useCountUp(expense);

  const topCategory = useMemo(() => {
    const totals = new Map<string, { label: string; amount: number }>();
    transactions
      .filter((tx) => tx.exp_tt_id === 1)
      .forEach((tx) => {
        const existing = totals.get(tx.exp_tc_id);
        const amount = Number(tx.exp_ts_amount) || 0;
        if (existing) {
          existing.amount += amount;
        } else {
          totals.set(tx.exp_tc_id, { label: tx.exp_ts_category, amount });
        }
      });
    return Array.from(totals.values()).sort((a, b) => b.amount - a.amount)[0];
  }, [transactions]);

  return (
    <View style={[styles.card, { backgroundColor: colors.primary }]}>
      <View
        style={[
          styles.switcherStrip,
          { backgroundColor: theme === 'dark' ? DARK_STRIP_BG : colors.secondary },
        ]}
        pointerEvents={switcherDisabled ? 'none' : 'auto'}>
        <MonthSwitcher
          nextMonth={nextMonth}
          prevMonth={prevMonth}
          currentMonth={currentMonth}
          currentDate={currentDate}
          dateRangeType={dateRangeType}
          onSelectDate={onSelectDate}
          label={periodLabel}
          contentColor={colors.onPrimary}
          iconSize={20}
          monthFontSize={12}
          labelFontSize={12}
          rowSpacing={0}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.splitRow}>
          <View style={styles.balanceCol}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.onPrimary }]}>Balance</Text>
              {!isBaseBalanceVisible && (
                <TouchableOpacity onPress={() => setBalancePeeked((prev) => !prev)} hitSlop={8}>
                  <Feather
                    name={isBalanceVisible ? 'eye' : 'eye-off'}
                    size={12}
                    color={colors.onPrimary}
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.balance, { color: colors.onPrimary }]} numberOfLines={1}>
              {isBalanceVisible ? formatToCurrency(animatedBalance, undefined, balance) : '••••••'}
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
                  {formatToCurrency(animatedIncome, undefined, income)}
                </Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <View style={[styles.iconSquare, { backgroundColor: colors.onPrimaryStrong }]}>
                <Feather name="arrow-up-right" size={13} color={colors.expense} />
              </View>
              <View style={styles.statText}>
                <Text style={[styles.statLabel, { color: colors.onPrimary }]}>Expense</Text>
                <Text style={[styles.statValue, { color: colors.onPrimary }]} numberOfLines={1}>
                  {formatToCurrency(animatedExpense, undefined, expense)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {showNetWorth && (
          <View
            style={[styles.footer, styles.footerRow, { borderTopColor: colors.onPrimaryBorder }]}>
            <View style={styles.netWorthRow}>
              <Text style={[styles.footerText, { color: colors.onPrimary }]} numberOfLines={1}>
                Net worth:{' '}
                <Text style={styles.footerValue}>
                  {isNetWorthVisible ? formatToCurrency(netWorth) : '••••••'}
                </Text>
              </Text>
              {!isBaseNetWorthVisible && (
                <TouchableOpacity onPress={() => setNetWorthPeeked((prev) => !prev)} hitSlop={8}>
                  <Feather
                    name={isNetWorthVisible ? 'eye' : 'eye-off'}
                    size={12}
                    color={colors.onPrimary}
                  />
                </TouchableOpacity>
              )}
            </View>
            {!!topCategory && (
              <Text
                style={[styles.footerText, { color: colors.onPrimary, flexShrink: 1 }]}
                numberOfLines={1}>
                Top: <Text style={styles.footerValue}>{topCategory.label}</Text>
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  switcherStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  body: {
    padding: 16,
  },
  label: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.75,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  netWorthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  balance: {
    fontSize: FontSize.xl,
    fontFamily: 'Inter-700',
    marginTop: 2,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  balanceCol: {
    flex: 1,
    minWidth: 0,
  },
  statsCol: {
    width: '40%',
    gap: 6,
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
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  footerRow: {
    justifyContent: 'space-between',
    gap: 10,
  },
  footerText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
    opacity: 0.9,
  },
  footerValue: {
    fontFamily: 'Inter-600',
  },
});
