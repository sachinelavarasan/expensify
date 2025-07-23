import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import { formattedAmount } from '@/utils/formatter';

const CARDGAP = 10;

const { width } = Dimensions.get('window');

const HomeHeader = ({ income, expense }: { income: number; expense: number }) => {
  const cardWidth = (width - CARDGAP * 3) / 2;
  return (
    <View>
      <View style={styles.topContainer}>
        <View style={[styles.card, { width: cardWidth }]}>
          <View>
            <Text style={styles.cardTitle}>Income</Text>
            <Text style={styles.cardSubtitle}>{formattedAmount(income)}</Text>
          </View>
          <View>
            <Feather name="arrow-down-left" size={24} color="#00C896" />
          </View>
        </View>
        <View style={[styles.card, { width: cardWidth }]}>
          <View>
            <Text style={styles.cardTitle}>Expense</Text>
            <Text style={styles.cardSubtitle}>{formattedAmount(expense)}</Text>
          </View>
          <View>
            <Feather name="arrow-up-right" size={24} color="#FF4D4F" />
          </View>
        </View>
      </View>
      <View style={styles.balance}>
        <Text style={[styles.balanceText, { color: '#EDEDED' }]}>Balance: {''}</Text>
        <Text style={[styles.balanceText, { color: '#EDEDED', fontFamily: 'Inter-700' }]}>
          {formattedAmount(income - expense)}
        </Text>
      </View>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  topContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  btnContainer: {
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#292933',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    columnGap: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#C6BFFF',
    fontSize: 16,
    fontFamily: 'Inter-700',
    paddingBottom: 5,
  },
  cardSubtitle: {
    color: '#9A6FFF',
    fontSize: 16,
    fontFamily: 'Inter-500',
  },
  balance: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#6900FF',
    maxWidth: width - 130,
    alignSelf: 'center',
    marginVertical: 10,
  },
  balanceText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter-500',
  },

  loader: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
