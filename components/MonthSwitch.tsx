import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemedContext';

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
      <TouchableOpacity onPress={prevMonth} style={{ paddingRight: 8 }}>
        <MaterialIcons name="keyboard-arrow-left" size={30} color={colors.arrowColor} />
      </TouchableOpacity>

      <Text
        style={[styles.month, { color: colors.monthSwitcher }]}
        numberOfLines={1}
        ellipsizeMode="tail">
        {currentMonth}
      </Text>

      <TouchableOpacity onPress={nextMonth} style={{ paddingLeft: 8 }}>
        <MaterialIcons name="keyboard-arrow-right" size={30} color={colors.arrowColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  month: {
    fontSize: 16,
    fontFamily: 'Inter-700',
    textTransform: 'uppercase',
    flexShrink: 1,
    minWidth: 0,
  },
  monthSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    flex: 1,
    minWidth: 0,
  },
});

export default MonthSwitcher;
