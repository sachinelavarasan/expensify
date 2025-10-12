import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Itransaction } from '@/types';
import { formatToCurrency, timeCoverter } from '@/utils/formatter';
import { deviceWidth } from '@/utils/functions';
import { useThemeContext } from '@/contexts/ThemedContext';

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
  exp_ba_name,
  isStarred,
  showTsTime = true,
  noRedirect = false,
}: Itransaction & { isStarred?: boolean; showTsTime?: boolean; noRedirect?: boolean }) => {
  const { colors } = useThemeContext();
  return (
    <Link
      href={`/transaction?exp_ts_id=${exp_ts_id}${isStarred ? '&starred=true' : ''}`}
      asChild
      disabled={noRedirect}>
      <TouchableOpacity
        onPress={() => {}}
        activeOpacity={0.2}
        style={{
          width: '100%',
          borderRadius: 5,
          paddingVertical: 4,
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
                <Text style={[styles.name, { color: colors.title }]} numberOfLines={2}>
                  {exp_ts_title}
                </Text>
              </View>
              <View style={styles.subTextContainer}>
                <Text
                  style={[
                    styles.subText,
                    { marginRight: 6, fontFamily: 'Inter-500', color: colors.lighterTitle },
                  ]}>
                  {exp_ts_category}
                </Text>
                <View
                  style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                  {!!showTsTime && (
                    <Text
                      style={[
                        styles.subText,
                        { fontFamily: 'Inter-500', color: colors.description },
                      ]}>
                      <Text>{'\u2022'}</Text> {timeCoverter(exp_ts_time)}
                    </Text>
                  )}
                </View>
              </View>
              <View style={{ alignItems: 'flex-start' }}>
                <View
                  style={{
                    borderColor: colors.borderColor,
                    borderWidth: 1,
                    borderRadius: 4,
                    paddingHorizontal: 5,
                    paddingVertical: 2,
                    alignItems: 'center',
                    marginTop: 2,
                    flexDirection:'row',
                    gap: 4
                  }}>
                  <MaterialIcons name={'payments'} size={18} color={colors.secondary } />
                  <Text
                    style={[styles.subText, { fontFamily: 'Inter-400', color: colors.secondary }]}>
                    {exp_ba_name}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.right}>
            <Text
              style={[styles.amount, { color: exp_tt_id === 2 ? colors.income : colors.expense }]}>
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
    borderRadius: 5,
  },
  name: {
    color: '#F1F1F6',
    fontSize: 15,
    fontFamily: 'Inter-600',
    maxWidth: deviceWidth() - 150,
  },
  subText: {
    color: '#B3B1C4',
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
    fontFamily: 'Inter-600',
  },
});
