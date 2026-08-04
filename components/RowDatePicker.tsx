import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { Text } from 'react-native';
import { format, parseISO } from 'date-fns';
import { DatePickerModal, en, registerTranslation } from 'react-native-paper-dates';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';
import RowField from '@/components/RowField';
registerTranslation('en', en);

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
    const [minimum, setMinimumDate] = useState<Date>();
    const [pickerDate, setPickerDate] = useState<Date>(new Date());

    useEffect(() => {
      if (minimumDate) {
        const date = new Date(minimumDate);
        setMinimumDate(date);
        setPickerDate(date);
        onChange(formatDateForStorage(date));
      }
    }, [minimumDate]);

    const onDismissSingle = useCallback(() => {
      setOpen(false);
    }, [setOpen]);

    const onConfirmSingle = useCallback(
      (params: any) => {
        setOpen(false);
        const formatted = formatDateForStorage(params.date);
        setPickerDate(new Date(formatted));
        onChange(formatted);
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

        <DatePickerModal
          presentationStyle="pageSheet"
          locale="en"
          mode="single"
          label={value ? formatDateForDisplay(parseISO(value)) : placeholder || 'Pick a date'}
          visible={open}
          onDismiss={onDismissSingle}
          date={pickerDate}
          onConfirm={onConfirmSingle}
          uppercase={true}
          validRange={{ startDate: minimum }}
        />
      </>
    );
  },
);

RowDatePicker.displayName = 'RowDatePicker';
export default RowDatePicker;
