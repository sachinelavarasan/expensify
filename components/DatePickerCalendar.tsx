import { Entypo } from '@expo/vector-icons';
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { MarkedDates } from 'react-native-calendars/src/types';
import { format, parseISO } from 'date-fns';
import { useThemeContext } from '@/contexts/ThemedContext';
import ModalCard from '@/components/ModalCard';

interface Props {
  value: string | undefined;
  onChange: (date: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  isRequired?: boolean;
  label?: string;
  minimumDate?: string;
}

const DatePickerCalendar = forwardRef<any, Props>(
  ({ value, onChange, onBlur, error, placeholder, isRequired, label, minimumDate }, ref) => {
    const [open, setOpen] = useState(false);
    const { colors } = useThemeContext();
    const [minimum, setMinimumDate] = useState<string>();
    const [pickerDate, setPickerDate] = useState<Date>();

    useEffect(() => {
      if (minimumDate) {
        const date = new Date(minimumDate);
        setMinimumDate(formatDateForStorage(date));
        onChange('');
      }
    }, [minimumDate]);

    const onDismissSingle = useCallback(() => {
      setOpen(false);
    }, [setOpen]);

    const onDayPress = useCallback(
      (day: DateData) => {
        setOpen(false);
        setPickerDate(new Date(day.dateString));
        onChange(day.dateString);
      },
      [onChange],
    );

    useEffect(() => {
      if (value) {
        const date = value ? parseISO(value) : new Date();
        setPickerDate(date);
        onChange(formatDateForStorage(date));
      }
    }, [value]);

    const formatDateForDisplay = (date: Date) => format(date, 'EEE, MMM d, yyyy');
    const formatDateForStorage = (date: Date) => format(date, 'yyyy-MM-dd');

    const markedDates = useMemo((): MarkedDates => {
      if (!value) return {};
      return {
        [value]: { selected: true, selectedColor: colors.primary, selectedTextColor: colors.onPrimary },
      };
    }, [value, colors]);

    return (
      <View>
        <View style={label ? { flexDirection: 'row', alignItems: 'center', gap: 10 } : {}}>
          <View>
            {label ? (
              <Text
                style={{
                  fontSize: 14,
                  color: colors.title,
                  marginBottom: 6,
                  fontFamily: 'Inter-400',
                }}>
                {label}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() => {
              setOpen(true);
              if (onBlur) onBlur();
            }}
            style={{
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              borderColor: colors.inputBorder,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.inputColor,
              gap: 15,
            }}>
            <Entypo name="calendar" size={14} color={colors.title} />
            <Text style={{ color: colors.title,  fontFamily: 'Inter-500' }}>
              {value ? formatDateForDisplay(parseISO(value)) : placeholder || 'Pick a date'}
            </Text>
          </TouchableOpacity>
        </View>

        <ModalCard
          visible={open}
          onClose={onDismissSingle}
          presentation="sheet"
          title={label || placeholder || 'Pick a date'}>
          <Calendar
            current={pickerDate ? formatDateForStorage(pickerDate) : undefined}
            minDate={minimum}
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

        {!!error && (
          <Text
            style={{
              fontSize: 12,
              color: colors.expense,
              marginTop: 4,
              fontFamily: 'Inter-300',
              maxWidth: 100,
            }}
            numberOfLines={1}>
            {error}
          </Text>
        )}
      </View>
    );
  },
);

DatePickerCalendar.displayName = 'DatePickerCalendar';
export default DatePickerCalendar;
