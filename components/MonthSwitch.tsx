import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Calendar, CalendarProvider, DateData, WeekCalendar } from 'react-native-calendars';
import { format, startOfWeek, addDays } from 'date-fns';
import { useThemeContext } from '@/contexts/ThemedContext';
import ModalCard from '@/components/ModalCard';
import { MONTH_LABELS } from '@/utils/common-data';

type DateRangeType = 'daily' | 'weekly' | 'monthly';

const MonthSwitcher = ({
  nextMonth,
  prevMonth,
  currentMonth,
  currentDate,
  dateRangeType,
  onSelectDate,
}: {
  nextMonth: () => void;
  prevMonth: () => void;
  currentMonth: string;
  // The following are optional so existing usages that only need the
  // prev/next arrows keep working unchanged - the "tap to pick" sheet is
  // opt-in based on whether these are supplied.
  currentDate?: Date;
  dateRangeType?: DateRangeType;
  onSelectDate?: (date: Date) => void;
}) => {
  const { colors } = useThemeContext();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => (currentDate ?? new Date()).getFullYear());
  // Drives the week picker's own header (title + prev/next arrows) - kept
  // separate from `currentDate` so swiping/arrowing through weeks inside the
  // sheet doesn't touch the applied filter until a day is actually tapped.
  const [weekPickerDate, setWeekPickerDate] = useState(() => currentDate ?? new Date());
  // WeekCalendar sizes its 7-day row against a fixed pixel width (screen width
  // by default) instead of the flex/percentage sizing the month Calendar uses,
  // so inside the ModalCard sheet's own horizontal padding it always overflows
  // and pushes the last day off-screen. Measuring the actual rendered width
  // here and feeding it back in as `calendarWidth` keeps the row matched to
  // the space it really has, however the sheet ends up padded.
  const [weekCalendarWidth, setWeekCalendarWidth] = useState<number>();
  const canPick = !!currentDate && !!onSelectDate;

  const openPicker = () => {
    if (!canPick) return;
    setPickerYear((currentDate as Date).getFullYear());
    setWeekPickerDate(currentDate as Date);
    setPickerVisible(true);
  };

  const handleMonthSelect = (monthIndex: number) => {
    onSelectDate?.(new Date(pickerYear, monthIndex, 1));
    setPickerVisible(false);
  };

  const handleDaySelect = (day: DateData) => {
    onSelectDate?.(new Date(day.dateString));
    setPickerVisible(false);
  };

  const pickerTitle =
    dateRangeType === 'monthly'
      ? 'Select Month'
      : dateRangeType === 'weekly'
        ? 'Select Week'
        : 'Select Date';

  // Bands the whole Mon-Sun week currently visible in the strip (not
  // necessarily the applied one - the user may have swiped/arrowed without
  // tapping a day yet) so WeekCalendar reads as "this is the week you're
  // looking at", not just a single highlighted day.
  const weekMarkedDates = useMemo(() => {
    const start = startOfWeek(weekPickerDate, { weekStartsOn: 1 });
    const marks: Record<string, { startingDay?: boolean; endingDay?: boolean; color: string; textColor: string }> =
      {};
    for (let i = 0; i < 7; i += 1) {
      const day = addDays(start, i);
      marks[format(day, 'yyyy-MM-dd')] = {
        startingDay: i === 0,
        endingDay: i === 6,
        color: colors.primary,
        textColor: colors.onPrimary,
      };
    }
    return marks;
  }, [weekPickerDate, colors]);

  const weekRangeLabel = useMemo(() => {
    const start = startOfWeek(weekPickerDate, { weekStartsOn: 1 });
    const end = addDays(start, 6);
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  }, [weekPickerDate]);

  const calendarTheme = {
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
  };

  return (
    <View style={styles.monthSwitch}>
      <TouchableOpacity onPress={prevMonth} style={styles.arrowButton}>
        <MaterialIcons name="keyboard-arrow-left" size={26} color={colors.arrowColor} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={openPicker}
        disabled={!canPick}
        style={styles.monthTextWrapper}
        hitSlop={{ top: 6, bottom: 6 }}>
        <Text
          style={[styles.month, { color: colors.monthSwitcher }]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {currentMonth}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={nextMonth} style={styles.arrowButton}>
        <MaterialIcons name="keyboard-arrow-right" size={26} color={colors.arrowColor} />
      </TouchableOpacity>

      {canPick && (
        <ModalCard
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          presentation="sheet"
          title={pickerTitle}>
          {dateRangeType === 'monthly' ? (
            <View>
              <View style={styles.yearRow}>
                <TouchableOpacity
                  onPress={() => setPickerYear((y) => y - 1)}
                  style={styles.arrowButton}>
                  <MaterialIcons name="keyboard-arrow-left" size={24} color={colors.arrowColor} />
                </TouchableOpacity>
                <Text style={[styles.yearText, { color: colors.title }]}>{pickerYear}</Text>
                <TouchableOpacity
                  onPress={() => setPickerYear((y) => y + 1)}
                  style={styles.arrowButton}>
                  <MaterialIcons
                    name="keyboard-arrow-right"
                    size={24}
                    color={colors.arrowColor}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.monthGrid}>
                {MONTH_LABELS.map((label, index) => {
                  const isSelected =
                    pickerYear === (currentDate as Date).getFullYear() &&
                    index === (currentDate as Date).getMonth();
                  return (
                    <TouchableOpacity
                      key={label}
                      onPress={() => handleMonthSelect(index)}
                      style={[
                        styles.monthCell,
                        { backgroundColor: isSelected ? colors.primary : colors.inputColor },
                      ]}>
                      <Text
                        style={[
                          styles.monthCellText,
                          { color: isSelected ? colors.onPrimary : colors.title },
                        ]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : dateRangeType === 'weekly' ? (
            // Full layout: our own header (range label + prev/next week arrows)
            // sitting above WeekCalendar's day-names row + swipeable week strip -
            // WeekCalendar has no built-in header of its own, only swipe
            // navigation, so without this the sheet wouldn't say which week/month
            // is even showing.
            <View onLayout={(e) => setWeekCalendarWidth(e.nativeEvent.layout.width)}>
              <View style={styles.yearRow}>
                <TouchableOpacity
                  onPress={() => setWeekPickerDate((d) => addDays(d, -7))}
                  style={styles.arrowButton}>
                  <MaterialIcons name="keyboard-arrow-left" size={24} color={colors.arrowColor} />
                </TouchableOpacity>
                <Text style={[styles.yearText, { color: colors.title }]} numberOfLines={1}>
                  {weekRangeLabel}
                </Text>
                <TouchableOpacity
                  onPress={() => setWeekPickerDate((d) => addDays(d, 7))}
                  style={styles.arrowButton}>
                  <MaterialIcons
                    name="keyboard-arrow-right"
                    size={24}
                    color={colors.arrowColor}
                  />
                </TouchableOpacity>
              </View>
              {!!weekCalendarWidth && (
                <CalendarProvider
                  date={format(weekPickerDate, 'yyyy-MM-dd')}
                  onDateChanged={(date, updateSource) => {
                    // Keep the header/highlight in sync with both swipe and arrow
                    // navigation, but only commit the selection (and close the
                    // sheet) on an explicit day tap.
                    setWeekPickerDate(new Date(date));
                    if (updateSource === 'dayPress') {
                      onSelectDate?.(new Date(date));
                      setPickerVisible(false);
                    }
                  }}>
                  <WeekCalendar
                    firstDay={1}
                    markingType="period"
                    markedDates={weekMarkedDates}
                    calendarWidth={weekCalendarWidth}
                    theme={calendarTheme}
                  />
                </CalendarProvider>
              )}
            </View>
          ) : (
            <Calendar
              current={format(currentDate as Date, 'yyyy-MM-dd')}
              onDayPress={handleDaySelect}
              firstDay={1}
              markedDates={{
                [format(currentDate as Date, 'yyyy-MM-dd')]: {
                  selected: true,
                  selectedColor: colors.primary,
                  selectedTextColor: colors.onPrimary,
                },
              }}
              style={{ paddingHorizontal: 10 }}
              theme={calendarTheme}
            />
          )}
        </ModalCard>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  month: {
    fontSize: 14,
    fontFamily: 'Inter-700',
    textTransform: 'uppercase',
    flexShrink: 1,
    minWidth: 0,
  },
  monthTextWrapper: {
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
  arrowButton: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 18,
  },
  yearText: {
    fontSize: 16,
    fontFamily: 'Inter-700',
    minWidth: 60,
    textAlign: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  monthCell: {
    width: '22%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCellText: {
    fontSize: 14,
    fontFamily: 'Inter-600',
  },
});

export default MonthSwitcher;
