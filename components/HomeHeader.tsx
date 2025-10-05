import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { formatToCurrency } from '@/utils/formatter';
import { deviceWidth } from '@/utils/functions';
import { useGetSettingsFromStore } from '@/hooks/useGetSettingsValue';

const CARDGAP = 15;
const width = deviceWidth();
const cardWidth = (width - CARDGAP * 3) / 2;

const HomeHeader = ({ income, expense }: { income: number; expense: number }) => {
  const { value: showBalance } = useGetSettingsFromStore('balance');

  return (
    <View>
      {/* Income + Expense */}
      <View style={[styles.topContainer, !showBalance && { marginBottom: 5 }]}>
        {/* Income Card */}
        <LinearGradient
          colors={['#1D2B64', '#1E1B30']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { width: cardWidth }]}>
          <View>
            <Text style={styles.cardTitle}>Income</Text>
            <Text style={styles.cardSubtitle} numberOfLines={2}>
              {formatToCurrency(income)}
            </Text>
          </View>
          <View style={styles.iconBadgeGreen}>
            <Feather name="arrow-down-left" size={16} color="#00C896" />
          </View>
        </LinearGradient>

        {/* Expense Card */}
        <LinearGradient
          colors={['#3A0A0A', '#1E1B30']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { width: cardWidth }]}>
          <View>
            <Text style={styles.cardTitle}>Expense</Text>
            <Text style={styles.cardSubtitle} numberOfLines={2}>
              {formatToCurrency(expense)}
            </Text>
          </View>
          <View style={styles.iconBadgeRed}>
            <Feather name="arrow-up-right" size={16} color="#FF4D4F" />
          </View>
        </LinearGradient>
      </View>

      {!!showBalance && (
        <LinearGradient
          colors={['#2E2654', '#1E1B30']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.balance, { marginBottom: 0 }]}>
          <Text style={[styles.balanceText, { opacity: 0.8 }]}>Balance:</Text>
          <Text
            style={[styles.balanceText, { fontFamily: 'Inter-600', marginLeft: 6, color: '#FFF' }]}
            numberOfLines={1}>
            {formatToCurrency(income - expense)}
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
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  cardTitle: {
    color: '#F4F5F8',
    fontSize: 13,
    fontFamily: 'Inter-600',
    paddingBottom: 5,
  },
  cardSubtitle: {
    color: '#E0E0FF',
    fontSize: 12,
    fontFamily: 'Inter-700',
    maxWidth: cardWidth - 50,
  },
  iconBadgeGreen: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,200,150,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeRed: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,77,79,0.15)',
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
    color: '#EDEDED',
  },
});
