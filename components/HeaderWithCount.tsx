import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface HeaderWithCountProps {
  title: string;
  count?: number;
  countText?: string;
  subTitle?: boolean;
}

const HeaderWithCount = ({ title, count, countText, subTitle }: HeaderWithCountProps) => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        justifyContent: 'space-between',
      }}>
      <Text style={subTitle ? styles.subTitle : styles.header}>{title}</Text>
      {count && count > 0 ? (
        <View style={styles.countSpan}>
          <Text style={[styles.count]}>{String(count).padStart(2, '0')}</Text>
          {countText ? <Text style={styles.countText}>{countText}</Text> : null}
        </View>
      ) : null}
    </View>
  );
};

export default HeaderWithCount;

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-700',
    textTransform: 'capitalize',
  },
  count: {
    fontSize: 24,
    fontFamily: 'Inter-500',
    color: 'rgba(255,200,58,0.78)',
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
    color: '#c7c7c7',
    fontSize: 16,
    fontFamily: 'Inter-500',
    marginLeft: 3,
  },
  subTitle: {
    fontSize: 18,
    color: '#b7b6c1',
    fontFamily: 'Inter-700',
  },
});
