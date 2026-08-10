import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';
import { MarkedDates } from 'react-native-calendars/src/types';
import { format } from 'date-fns';
import { useThemeContext } from '@/contexts/ThemedContext';
import { MONTH_LABELS } from '@/utils/common-data';
import ModalCard from '@/components/ModalCard';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  // The month currently browsed (day is irrelevant, only used to derive
  // year/month) - callers own this as part of their own picker state.
  pickerDate: Date;
  // Fired when the year arrows or a month chip is tapped - only moves what's
  // browsed, doesn't commit a selection.
  onBrowse: (date: Date) => void;
  onDayPress: (day: DateData) => void;
  minDate?: string;
  markedDates: MarkedDates;
}

// Shared by every "pick a single date" sheet (transaction date, export/import
// range, debt due date, recurring transaction start date, ...): a year row +
// month strip to jump straight to a far-off month, followed by the day grid.
// Kept as one component so all of them stay visually and behaviorally in
// sync rather than re-diverging copy by copy.
export default function CalendarPickerSheet({
  visible,
  onClose,
  title,
  pickerDate,
  onBrowse,
  onDayPress,
  minDate,
  markedDates,
}: Props) {
  const { colors } = useThemeContext();

  const goToYear = useCallback(
    (delta: number) => {
      onBrowse(new Date(pickerDate.getFullYear() + delta, pickerDate.getMonth(), 1));
    },
    [pickerDate, onBrowse],
  );

  const goToMonth = useCallback(
    (monthIndex: number) => {
      onBrowse(new Date(pickerDate.getFullYear(), monthIndex, 1));
    },
    [pickerDate, onBrowse],
  );

  return (
    <ModalCard
      visible={visible}
      onClose={onClose}
      presentation="sheet"
      title={title || 'Pick a date'}>
      <View style={styles.yearRow}>
        <TouchableOpacity onPress={() => goToYear(-1)} style={styles.arrowButton}>
          <MaterialIcons name="keyboard-arrow-left" size={22} color={colors.arrowColor} />
        </TouchableOpacity>
        <Text style={[styles.yearText, { color: colors.title }]}>{pickerDate.getFullYear()}</Text>
        <TouchableOpacity onPress={() => goToYear(1)} style={styles.arrowButton}>
          <MaterialIcons name="keyboard-arrow-right" size={22} color={colors.arrowColor} />
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.monthStrip}>
        {MONTH_LABELS.map((monthLabel, index) => {
          const isSelected = index === pickerDate.getMonth();
          return (
            <TouchableOpacity
              key={monthLabel}
              onPress={() => goToMonth(index)}
              style={[
                styles.monthChip,
                { backgroundColor: isSelected ? colors.primary : colors.inputColor },
              ]}>
              <Text
                style={[
                  styles.monthChipText,
                  { color: isSelected ? colors.onPrimary : colors.title },
                ]}>
                {monthLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <Calendar
        // `current` only seeds Calendar's internal month state on first
        // mount - it isn't watched afterwards, so jumping the year/month
        // above wouldn't otherwise move what's actually displayed here.
        // Keying on the browsed month forces a remount so the new `current`
        // takes effect.
        key={format(pickerDate, 'yyyy-MM')}
        current={format(pickerDate, 'yyyy-MM-dd')}
        minDate={minDate}
        markedDates={markedDates}
        onDayPress={onDayPress}
        firstDay={1}
        style={{ paddingHorizontal: 10 }}
        theme={{
          backgroundColor: 'transparent',
          calendarBackground: 'transparent',
          textSectionTitleColor: colors.lighterTitle,
          dayTextColor: colors.title,
          textDisabledColor: colors.lighterTitle,
          todayTextColor: colors.primary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: colors.onPrimary,
          monthTextColor: colors.title,
          arrowColor: colors.arrowColor,
          textDayFontFamily: 'Inter-500',
          textMonthFontFamily: 'Inter-700',
          textDayHeaderFontFamily: 'Inter-600',
          textDayFontSize: 13,
          textMonthFontSize: 15,
          textDayHeaderFontSize: 11,
        }}
      />
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 8,
  },
  arrowButton: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearText: {
    fontSize: 16,
    fontFamily: 'Inter-700',
    minWidth: 60,
    textAlign: 'center',
  },
  monthStrip: {
    gap: 8,
    paddingHorizontal: 10,
    paddingBottom: 12,
  },
  monthChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthChipText: {
    fontSize: 13,
    fontFamily: 'Inter-600',
  },
});
