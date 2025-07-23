import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const MonthSwitcher = ({
  nextMonth,
  prevMonth,
  currentMonth,
}: {
  nextMonth: () => void;
  prevMonth: () => void;
  currentMonth: string;
}) => {
  return (
    <View style={styles.monthSwitch}>
      <TouchableOpacity onPress={prevMonth} style={{ paddingHorizontal: 10 }}>
        <AntDesign name="left" color="#8880A0" size={18} />
      </TouchableOpacity>

      <Text style={styles.month}>{currentMonth}</Text>

      <TouchableOpacity onPress={nextMonth} style={{ paddingHorizontal: 10 }}>
        <AntDesign name="right" color="#8880A0" size={18} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  month: {
    color: '#C6BFFF',
    fontSize: 18,
    fontFamily: 'Inter-600',
  },
  monthSwitch: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
});

export default MonthSwitcher;
