import React, { useRef } from 'react';
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
  onPress,
  onLongPress,
}: Itransaction & {
  isStarred?: boolean;
  showTsTime?: boolean;
  noRedirect?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}) => {
  const { colors } = useThemeContext();
  // TouchableOpacity can fire onPress right after onLongPress completes on
  // release - without suppressing that trailing press, a long-press-to-select
  // would immediately get toggled back off by the press that follows it.
  const wasLongPress = useRef(false);

  // Link's `disabled` prop isn't specially handled by expo-router - it just
  // falls through to the underlying TouchableOpacity as React Native's native
  // `disabled`, which kills ALL touch handling (onPress/onLongPress/onPressIn),
  // not just Link's own navigation. So when noRedirect is true (selection mode),
  // skip Link entirely instead of trying to "disable" it - that's the only way
  // to keep onPress/onLongPress alive while suppressing navigation.
  const cardBody = (
    <TouchableOpacity
      onPressIn={() => {
        wasLongPress.current = false;
      }}
      onLongPress={() => {
        wasLongPress.current = true;
        onLongPress?.();
      }}
      onPress={() => {
        if (wasLongPress.current) return;
        (onPress ?? (() => {}))();
      }}
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
                backgroundColor: exp_tc_icon_bg_color ? exp_tc_icon_bg_color : colors.categoryFallbackBg,
                padding: 8,
                borderRadius: 5,
                marginTop:2,
                alignSelf: 'flex-start'
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
                color={colors.categoryFallbackIcon}
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
                  <Text
                    style={[styles.subText, { fontSize: 10, color: colors.secondary }]}>
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
  );

  if (noRedirect) {
    return cardBody;
  }

  return (
    <Link
      href={`/transaction?exp_ts_id=${exp_ts_id}${isStarred ? '&starred=true' : ''}`}
      asChild>
      {cardBody}
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
    fontSize: 14,
    fontFamily: 'Inter-600',
    maxWidth: deviceWidth() - 150,
  },
  subText: {
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
