import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Itransaction } from '@/types';

const TransactionCard = ({
  exp_ts_title,
  exp_ts_date,
  exp_ts_note,
  exp_ts_time,
  exp_ts_amount,
  exp_ts_id,
  exp_ts_category,
  exp_ts_transaction_type,
  exp_tt_id,
  exp_tc_id,
}: Itransaction) => {
  return (
    <Link href={`/transaction?exp_ts_id=${exp_ts_id}`} asChild>
      <TouchableOpacity
        onPress={() => {}}
        activeOpacity={0.2}
        style={{
          width: '100%',
          borderRadius: 5,
          padding: 10,
        }}>
        <View style={styles.innerContainer}>
          <View style={styles.left}>
            <View style={{ backgroundColor: '#F8ECFD', padding: 5, borderRadius: 5 }}>
              <MaterialIcons name="category" size={24} color="#7173FF" />
            </View>
            <View>
              <View>
                <Text style={styles.name}>{exp_ts_title}</Text>
              </View>
              <View style={styles.subTextContainer}>
                <Text style={[styles.subText, { marginRight: 6 }]}>
                  {exp_ts_category} <Text>{'\u2022'}</Text>
                </Text>
                <Text style={[styles.subText, { fontFamily: 'Inter-600' }]}>{exp_ts_time}</Text>
              </View>
            </View>
          </View>
          <View style={styles.right}>
            <Text style={[styles.amount, { color: exp_tt_id === 2 ? '#00C896' : '#FF4D4F' }]}>
              {exp_tt_id === 2 ? '+' : '-'}
              {exp_ts_amount}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default TransactionCard;

const styles = StyleSheet.create({
  innerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1A1A24',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-500',
  },
  subText: {
    color: '#8880A0',
    fontSize: 12,
    fontFamily: 'Inter-400',
  },
  subTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  image: {
    transform: [{ rotateY: '180deg' }],
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  right: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  amount: {
    color: '#000000',
    fontSize: 12,
    fontFamily: 'Inter-500',
  },
});
