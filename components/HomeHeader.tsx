import { StyleSheet, Text, View } from 'react-native';
import React, {  } from 'react';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { formatToCurrency } from '@/utils/formatter';
import { deviceWidth } from '@/utils/functions';
import { useThemeContext } from '@/contexts/ThemedContext';

const CARDGAP = 14;
const width = deviceWidth();
const cardWidth = (width - CARDGAP * 3) / 2;

const HomeHeader = ({
  income,
  expense,
  balance,
  showBalance,
  carryBalance,
}: {
  income: number;
  expense: number;
  balance: number;
  showBalance: boolean;
  carryBalance: boolean;
}) => {
  const { colors } = useThemeContext();

  return (
    <View>
      <View style={[styles.topContainer, !balance && { marginBottom: 5 }]}>
        <LinearGradient
          colors={[`${colors.income}45`, `${colors.income}55`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { width: cardWidth }]}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.income }]}>Income</Text>
            <Text style={[styles.cardSubtitle, { color: colors.title }]} numberOfLines={2}>
              {formatToCurrency(income)}
            </Text>
          </View>
          <View style={[styles.iconBadgeGreen, { backgroundColor: `${colors.income}25` }]}>
            <Feather name="arrow-down-left" size={16} color={colors.income} />
          </View>
        </LinearGradient>

        <LinearGradient
          colors={[`${colors.expense}42`, `${colors.expense}48`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { width: cardWidth }]}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.expense }]}>Expense</Text>
            <Text style={[styles.cardSubtitle, { color: colors.title }]} numberOfLines={2}>
              {formatToCurrency(expense)}
            </Text>
          </View>
          <View style={[styles.iconBadgeRed, { backgroundColor: `${colors.expense}26` }]}>
            <Feather name="arrow-up-right" size={16} color={colors.expense} />
          </View>
        </LinearGradient>
      </View>

      {(!showBalance || carryBalance) && (
        <LinearGradient
          colors={colors.floatingBtnBg as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.balance, { marginBottom: 0 }]}>
          <Text style={[styles.balanceText, { color: colors.onPrimary }]}>Balance:</Text>
          <Text
            style={[
              styles.balanceText,
              { fontFamily: 'Inter-600', marginLeft: 6, color: colors.onPrimary },
            ]}
            numberOfLines={1}>
            {formatToCurrency(balance)}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  card: {
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // shadowColor: '#000',
    // shadowOpacity: 0.2,
    // shadowRadius: 6,
    // elevation: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Inter-600',
    paddingBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-700',
    maxWidth: cardWidth - 50,
  },
  iconBadgeGreen: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeRed: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balance: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  balanceText: {
    fontSize: 13,
    fontFamily: 'Inter-500',
  },
});
