import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { Text } from 'react-native';
import { format, parseISO } from 'date-fns';
import { DateData } from 'react-native-calendars';
import { MarkedDates } from 'react-native-calendars/src/types';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';
import RowField from '@/components/RowField';
import CalendarPickerSheet from '@/components/CalendarPickerSheet';

interface Props {
  value: string | undefined;
  onChange: (date: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  label?: string;
  minimumDate?: string;
  showDivider?: boolean;
}

const RowDatePicker = forwardRef<any, Props>(
  ({ value, onChange, onBlur, error, placeholder, label, minimumDate, showDivider }, ref) => {
    const { colors } = useThemeContext();
    const [open, setOpen] = useState(false);
    const [minimum, setMinimumDate] = useState<string>();
    const [pickerDate, setPickerDate] = useState<Date>(new Date());

    useEffect(() => {
      if (minimumDate) {
        const date = new Date(minimumDate);
        setMinimumDate(formatDateForStorage(date));
        setPickerDate(date);
        onChange(formatDateForStorage(date));
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
      const date = value ? parseISO(value) : new Date();
      if (date) {
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
      <>
        <RowField
          icon={<MaterialIcons name="calendar-today" size={17} color={colors.primary} />}
          label={label}
          error={error}
          showDivider={showDivider}
          onPress={() => {
            setOpen(true);
            onBlur?.();
          }}
          trailing={<MaterialIcons name="chevron-right" size={20} color={colors.arrowColor} />}>
          <Text style={{ fontSize: FontSize.base, fontFamily: 'Inter-600', color: colors.text }}>
            {value ? formatDateForDisplay(parseISO(value)) : placeholder || 'Pick a date'}
          </Text>
        </RowField>

        <CalendarPickerSheet
          visible={open}
          onClose={onDismissSingle}
          title={label || placeholder || 'Pick a date'}
          pickerDate={pickerDate}
          onBrowse={setPickerDate}
          onDayPress={onDayPress}
          minDate={minimum}
          markedDates={markedDates}
        />
      </>
    );
  },
);

RowDatePicker.displayName = 'RowDatePicker';
export default RowDatePicker;
