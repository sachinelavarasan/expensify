import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeContext } from '@/contexts/ThemedContext';

interface HeaderWithCountProps {
  title: string;
  count?: number;
  countText?: string;
  subTitle?: boolean;
}

const HeaderWithCount = ({ title, count, countText, subTitle }: HeaderWithCountProps) => {
  const { colors } = useThemeContext();
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        justifyContent: 'space-between',
      }}>
      <Text
        style={[
          subTitle ? styles.subTitle : styles.header,
          { color: subTitle ? colors.lighterTitle : colors.title },
        ]}>
        {title}
      </Text>
      {count && count > 0 ? (
        <View style={styles.countSpan}>
          <Text style={[styles.count, { color: colors.accent }]}>
            {String(count).padStart(2, '0')}
          </Text>
          {countText ? (
            <Text style={[styles.countText, { color: colors.lighterTitle }]}>{countText}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

export default HeaderWithCount;

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontFamily: 'Inter-700',
    textTransform: 'capitalize',
  },
  count: {
    fontSize: 24,
    fontFamily: 'Inter-500',
  },
  countSpan: {
    // backgroundColor: 'rgba(255,200,58,0.78)',
    borderRadius: 4,
    marginLeft: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 16,
    fontFamily: 'Inter-500',
    marginLeft: 3,
  },
  subTitle: {
    fontSize: 18,
    fontFamily: 'Inter-700',
  },
});
