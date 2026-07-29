import React, { useMemo } from 'react';
import { Calendar, DateData } from 'react-native-calendars';
import { MarkedDates } from 'react-native-calendars/src/types';
import { format } from 'date-fns';

import { useThemeContext } from '@/contexts/ThemedContext';

interface DayGroup {
  date: string;
  credit: number;
  debit: number;
}

interface Props {
  groupedDataArray: DayGroup[];
  currentDate: Date;
  onSelectDay: (date: string) => void;
  selectedDate?: string;
}

export default function CalendarGrid({
  groupedDataArray,
  currentDate,
  onSelectDay,
  selectedDate,
}: Props) {
  const { colors } = useThemeContext();

  const markedDates = useMemo(() => {
    const marks: MarkedDates = {};
    groupedDataArray.forEach((g) => {
      const dots = [];
      if (g.debit) dots.push({ key: 'debit', color: colors.expense });
      if (g.credit) dots.push({ key: 'credit', color: colors.income });
      if (dots.length) marks[g.date] = { dots };
    });
    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        selectedColor: colors.primary,
      };
    }
    return marks;
  }, [groupedDataArray, selectedDate, colors]);

  return (
    <Calendar
      initialDate={format(currentDate, 'yyyy-MM-dd')}
      markingType="multi-dot"
      markedDates={markedDates}
      onDayPress={(day: DateData) => onSelectDay(day.dateString)}
      firstDay={1}
      hideArrows
      disableMonthChange
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
  );
}
