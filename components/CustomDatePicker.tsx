import { Entypo } from '@expo/vector-icons';
import React, { forwardRef, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { format, parseISO } from 'date-fns';

interface Props {
  value: string;
  onChange: (date: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  isRequired?: boolean;
  label?: string;
  minimumDate?: string;
}

const CustomDatePicker = forwardRef<any, Props>(
  ({ value, onChange, onBlur, error, placeholder, isRequired, label, minimumDate }, ref) => {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date>(new Date());
    const [minimum, setMinimumDate] = useState<Date>();

    useEffect(() => {
      const date = value ? parseISO(value) : new Date();
      if (date) {
        setDate(date);
        onChange(formatDateForStorage(date));
      }
    }, [value]);

    useEffect(() => {
      if (minimumDate) {
        const date = new Date(minimumDate);
        setMinimumDate(date);
        setDate(date);
        onChange(formatDateForStorage(date));
      }
    }, [minimumDate]);

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
            if (onBlur) onBlur(); // handle blur manually
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
            justifyContent: 'center',
          }}>
          <Entypo name="calendar" size={14} color="#1E1E1E" style={{ marginRight: 5 }} />
          <Text style={{ color: '#fff', fontWeight: '500', fontFamily: 'Inter-500' }}>
            {date ? formatDateForDisplay(date) : placeholder || 'Pick a date'}
          </Text>
        </TouchableOpacity>

        <DatePicker
          modal
          open={open}
          date={date}
          mode="date"
          theme="dark"
          minimumDate={minimum}
          onConfirm={(selectedDate) => {
            setOpen(false);
            const formatted = formatDateForStorage(selectedDate);
            setDate(new Date(formatted));
            onChange(formatted);
          }}
          onCancel={() => setOpen(false)}
          buttonColor="#ffffff"
          title="Choose date"
          confirmText="Select"
          cancelText="Cancel"
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

CustomDatePicker.displayName = 'CustomDatePicker';
export default CustomDatePicker;
