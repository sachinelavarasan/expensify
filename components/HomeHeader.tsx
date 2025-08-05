import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import { formatToCurrency } from '@/utils/formatter';
import { deviceWidth } from '@/utils/functions';

const CARDGAP = 10;

const width  = deviceWidth();

const cardWidth = (width - CARDGAP * 3) / 2;
const HomeHeader = ({ income, expense }: { income: number; expense: number }) => {
  return (
    <View>
      <View style={styles.topContainer}>
        <View style={[styles.card, { width: cardWidth }]}>
          <View>
            <Text style={styles.cardTitle}>Income</Text>
            <Text style={styles.cardSubtitle} numberOfLines={2}>{formatToCurrency(income) }</Text>
          </View>
          <View>
            <Feather name="arrow-down-left" size={24} color="#00C896" />
          </View>
        </View>
        <View style={[styles.card, { width: cardWidth }]}>
          <View>
            <Text style={styles.cardTitle}>Expense</Text>
            <Text style={styles.cardSubtitle} numberOfLines={2}>{formatToCurrency(expense)}</Text>
          </View>
          <View>
            <Feather name="arrow-up-right" size={24} color="#FF4D4F" />
          </View>
        </View>
      </View>
      <View style={styles.balance}>
        <Text style={[styles.balanceText, { color: '#EDEDED' }]}>Balance: {''}</Text>
        <Text style={[styles.balanceText, { color: '#EDEDED', fontFamily: 'Inter-600' }]} numberOfLines={2}>
           {formatToCurrency((income - expense))}
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
    backgroundColor: '#282343',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    columnGap: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#F4F5F8',
    fontSize: 14,
    fontFamily: 'Inter-600',
    paddingBottom: 5,
  },
  cardSubtitle: {
    color: '#8F87F1',
    fontSize: 14,
    fontFamily: 'Inter-600',
    maxWidth: cardWidth - 50
  },
  balance: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#463e75',
    minWidth: cardWidth,
    width:'auto',
    alignSelf: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  balanceText: {
    fontSize: 14,
    fontFamily: 'Inter-500',
    maxWidth: cardWidth + 50
  },

  loader: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
