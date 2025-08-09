import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Itransaction } from '@/types';
import { formatToCurrency } from '@/utils/formatter';

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
  exp_st_id,
  exp_tc_icon,
  exp_tc_icon_bg_color,
  isStarred,
}: Itransaction & { isStarred?: boolean }) => {
  return (
    <Link href={`/transaction?exp_ts_id=${exp_ts_id}${isStarred ? '&starred=true' : ''}`} asChild>
      <TouchableOpacity
        onPress={() => {}}
        activeOpacity={0.2}
        style={{
          width: '100%',
          borderRadius: 5,
          paddingVertical: 7,
        }}>
        <View style={styles.innerContainer}>
          <View style={styles.left}>
            <View
              style={{
                backgroundColor: exp_tc_icon_bg_color ? exp_tc_icon_bg_color : '#282343',
                padding: 5,
                borderRadius: 5,
              }}>
              <MaterialIcons
                name={
                  exp_tc_icon
                    ? (exp_tc_icon as React.ComponentProps<typeof MaterialIcons>['name'])
                    : exp_tt_id === 2
                      ? 'trending-up'
                      : 'trending-down'
                }
                size={24}
                color="#e0deed"
              />
            </View>
            <View>
              <View>
                <Text style={styles.name}>{exp_ts_title}</Text>
              </View>
              <View style={styles.subTextContainer}>
                <Text style={[styles.subText, { marginRight: 6 }]}>{exp_ts_category}</Text>
                <View
                  style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                  <Text>{'\u2022'}</Text>
                  <Text style={[styles.subText, { fontFamily: 'Inter-600', color: '#999999' }]}>
                    {exp_ts_time}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.right}>
            <Text style={[styles.amount, { color: exp_tt_id === 2 ? '#48BB78' : '#F56565' }]}>
              {exp_tt_id === 2 ? '+' : '-'}
              {formatToCurrency(exp_ts_amount)}
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
    // backgroundColor: '#1e1a32',
    // paddingHorizontal: 14,
    // paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E2EA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.84,
    elevation: 1,
    backgroundColor: '#FFFFFF',
  },
  name: {
    color: '#1E1E1E',
    fontSize: 14,
    fontFamily: 'Inter-500',
  },
  subText: {
    color: '#282343',
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
    fontSize: 12,
    fontFamily: 'Inter-500',
  },
});
