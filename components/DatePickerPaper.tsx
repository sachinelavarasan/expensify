import { Entypo } from '@expo/vector-icons';
import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import { DatePickerModal, en, registerTranslation } from 'react-native-paper-dates';
registerTranslation('en', en);

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

const DatePickerPaper = forwardRef<any, Props>(
  ({ value, onChange, onBlur, error, placeholder, isRequired, label, minimumDate }, ref) => {
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
      <View>
        {label ? (
          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <Text
              style={{
                fontSize: 14,
                color: '#282343',
                marginBottom: 6,
                fontFamily: 'Inter-400',
              }}>
              {label}
            </Text>
          </View>
        ) : null}
        <TouchableOpacity
          onPress={() => {
            setOpen(true);
            if (onBlur) onBlur();
          }}
          style={{
            backgroundColor: '#6B5DE6',
            borderWidth: 1,
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 20,
            borderColor: 'transparent',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Entypo name="calendar" size={14} color="#ffffff" style={{ marginRight: 5 }} />
          <Text style={{ color: '#fff', fontWeight: '500', fontFamily: 'Inter-500' }}>
            {value ? formatDateForDisplay(parseISO(value)) : placeholder || 'Pick a date'}
          </Text>
        </TouchableOpacity>

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

        {!!error && (
          <Text
            style={{
              fontSize: 12,
              color: '#f02d3a',
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

DatePickerPaper.displayName = 'DatePickerPaper';
export default DatePickerPaper;
