// BankCard.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ColorValue,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatToCurrency } from '@/utils/formatter';

type BankCardProps = {
  bankName: string;
  holderName: string;
  accountNumber?: string;
  balance: number | string;
  currency?: string;
  variant?: 'dark' | 'light';
  accent?: string;
  onPress?: () => void;
  otherStyle?: StyleProp<ViewStyle>;
};

const maskAccount = (num: string) => (num.length <= 4 ? num : `•••• •••• •••• ${num.slice(-4)}`);

// const formatAmount = (amt: number, currency = 'USD') =>
//   new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amt);

const BankCard = ({
  bankName,
  holderName,
  accountNumber,
  balance,
  currency = 'USD',
  variant = 'dark',
  accent,
  onPress,
  otherStyle,
}: BankCardProps) => {
  const [showFull, setShowFull] = useState(false);

  const colors = useMemo(() => {
    if (variant === 'light') {
      return {
        text: '#0F0E17',
        sub: '#5A5A6A',
        chip: '#E6E6F2',
        grad: [accent || '#6C63FF', '#B388FF'],
        cardBg: ['#FFFFFF', '#F7F7FB'] as ColorValue[],
        border: '#E9E7F2',
      };
    }
    return {
      text: '#FFFFFF',
      sub: '#CFCFE6',
      chip: '#2B2748',
      grad: [accent || '#6C63FF', '#9E6BFF'],
      cardBg: ['#1A1535', '#0F0E25'] as ColorValue[],
      border: '#2F2A4F',
    };
  }, [variant, accent]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => (onPress ? onPress() : setShowFull((p) => !p))}
      style={[styles.wrapper, otherStyle]}>
      <LinearGradient
        colors={colors.cardBg as [ColorValue, ColorValue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor: colors.border }, otherStyle]}>
        {/* Accent ribbon */}
        <LinearGradient
          colors={colors.grad as [ColorValue, ColorValue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.ribbon}
        />

        {/* Top row */}
        <View style={[styles.row, { marginTop: 10 }]}>
          <Text style={[styles.bankName, { color: colors.text }]} numberOfLines={1}>
            {bankName}
          </Text>
          {/* <MaterialCommunityIcons
            name="contactless-payment"
            size={22}
            color={colors.sub}
          /> */}
        </View>

        <View style={[styles.row, { marginTop: 8 }]}>
          <View style={[styles.chip, { backgroundColor: colors.chip }]}>
            <View style={styles.chipInner} />
          </View>
          <MaterialCommunityIcons name="credit-card-chip" size={22} color={colors.sub} />
        </View>

        {/* Number */}
        {!!accountNumber && (
          <Text style={[styles.number, { color: colors.text }]}>
            {showFull ? accountNumber.replace(/(.{4})/g, '$1 ').trim() : maskAccount(accountNumber)}
          </Text>
        )}

        {/* Footer */}
        <View style={[styles.row, { marginTop: 10 }]}>
          <View>
            <Text style={[styles.label, { color: colors.sub }]}>Card Holder</Text>
            <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
              {holderName}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.label, { color: colors.sub }]}>Balance</Text>
            <Text style={[styles.value, { color: colors.text }]}>{formatToCurrency(balance)}</Text>
          </View>
        </View>

        {/* Hint */}
        <Text style={[styles.hint, { color: colors.sub }]}>
          {showFull ? 'Tap to hide details' : 'Tap to reveal details'}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default BankCard;

const styles = StyleSheet.create({
  wrapper: { width: 350 },
  card: {
    width: 350,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  ribbon: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    transform: [{ rotate: '35deg' }],
    opacity: 0.25,
    borderRadius: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankName: {
    fontSize: 16,
    fontWeight: '700',
  },
  chip: {
    width: 36,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  chipInner: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#FFD66B',
  },
  number: {
    marginTop: 16,
    fontSize: 18,
    letterSpacing: 2,
    fontWeight: '600',
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    marginTop: 12,
    fontSize: 11,
    textAlign: 'right',
  },
});
