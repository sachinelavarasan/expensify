import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { formatToCurrency } from '@/utils/formatter';
import { deviceWidth } from '@/utils/functions';
import { LinearGradient } from 'expo-linear-gradient';

const CARDGAP = 10;

const width = deviceWidth();

const cardWidth = (width - CARDGAP * 3) / 2;
const HomeHeader = ({ income, expense }: { income: number; expense: number }) => {
  return (
    <View>
      {/* <View style={styles.topContainer}>
        <View style={[styles.card, { width: cardWidth }]}>
          <View>
            <Text style={styles.cardTitle}>Income</Text>
            <Text style={styles.cardSubtitle} numberOfLines={2}>
              {formatToCurrency(income)}
            </Text>
          </View>
          <View>
            <Feather name="arrow-down-left" size={20} color="#F3F2F8" />
          </View>
        </View>
        <View style={[styles.card, { width: cardWidth }]}>
          <View>
            <Text style={styles.cardTitle}>Expense</Text>
            <Text style={styles.cardSubtitle} numberOfLines={3}>
              {formatToCurrency(expense)}
            </Text>
          </View>
          <View>
            <Feather name="arrow-up-right" size={20} color="#FF4D4F" />
          </View>
        </View>
      </View>
      <View>
        <View style={styles.balance}>
          <Text style={[styles.balanceText, { color: '#EDEDED' }]}>Balance: {''}</Text>
          <Text
            style={[styles.balanceText, { color: '#EDEDED', fontFamily: 'Inter-600' }]}
            numberOfLines={2}>
            {formatToCurrency(income - expense)}
          </Text>
        </View>
      </View> */}
      <LinearGradient
        colors={['#463E75', '#8E24AA', '#FF4081']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.linearGradientContainer}>
        <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
          {/* Title & Balance */}
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.totalBalanceTitle}>Total Balance</Text>
            <Text
              style={{
                color: '#FFFFFF',
                fontFamily: 'Inter-700',
                fontSize: 28,
                marginTop: 4,
              }}
              numberOfLines={2}>
              {formatToCurrency(income - expense)}
            </Text>
          </View>

          {/* Income & Expense Row */}
          <View style={styles.detailsContainer}>
            {/* Income */}
            <View style={{ alignItems: 'flex-start' }}>
              <View style={{ gap: 4, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="arrow-down-circle" size={20} color="#ffffff" />
                <Text style={styles.title}>Income</Text>
              </View>

              <Text style={styles.subTitle} numberOfLines={2}>
                {formatToCurrency(income)}
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Expense */}
            <View style={{ alignItems: 'flex-end' }}>
              <View style={{ gap: 4, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="arrow-up-circle" size={20} color="#ffffff" />
                <Text style={styles.title}>Expense</Text>
              </View>
              <Text style={styles.subTitle} numberOfLines={2}>
                {formatToCurrency(expense)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  linearGradientContainer: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    margin: 16,
  },
  title: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'Inter-600',
  },
  subTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-600',
    marginTop: 2,
  },
  totalBalanceTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontFamily: 'Inter-600',
  },
  divider: {
    borderColor: 'rgba(255,255,255,0.4)',
    borderWidth: 0.5,
    height: 30,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
