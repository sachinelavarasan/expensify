import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemedContext';
import { Colors } from '@/constants/Colors';

const MonthSwitcher = ({
  nextMonth,
  prevMonth,
  currentMonth,
}: {
  nextMonth: () => void;
  prevMonth: () => void;
  currentMonth: string;
}) => {
  const { colors } = useThemeContext();
  return (
    <View style={styles.monthSwitch}>
      <TouchableOpacity onPress={prevMonth} style={{ paddingHorizontal: 10 }}>
        <AntDesign name="left" color={colors.arrowColor} size={18} />
      </TouchableOpacity>

      <Text style={[styles.month, { color: colors.monthSwitcher }]}>{currentMonth}</Text>

      <TouchableOpacity onPress={nextMonth} style={{ paddingHorizontal: 10 }}>
        <AntDesign name="right" color={colors.arrowColor} size={18} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  month: {
    fontSize: 18,
    fontFamily: 'Inter-500',
  },
  monthSwitch: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
});

export default MonthSwitcher;
