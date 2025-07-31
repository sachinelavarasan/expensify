import { Entypo } from '@expo/vector-icons';
import React, { forwardRef, useState } from 'react';
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
}

const CustomDatePicker = forwardRef<any, Props>(
  ({ value, onChange, onBlur, error, placeholder, isRequired }, ref) => {
    const [open, setOpen] = useState(false);

    const date = value ? parseISO(value) : new Date();

    const formatDateForDisplay = (date: Date) => format(date, 'EEE, MMM d, yyyy'); // e.g., Mon, Mar 17, 2025
    const formatDateForStorage = (date: Date) => format(date, 'yyyy-MM-dd');

    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            setOpen(true);
            if (onBlur) onBlur(); // handle blur manually
          }}
          style={{
            backgroundColor: '#463e75',
            borderWidth: 1,
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 20,
            borderColor: 'transparent',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Entypo name="calendar" size={14} color="#FFF" style={{ marginRight: 5 }} />
          <Text style={{ color: '#fff', fontWeight: '500', fontFamily: 'Inter-500' }}>
            {value ? formatDateForDisplay(date) : placeholder || 'Pick a date'}
          </Text>
        </TouchableOpacity>

        <DatePicker
          modal
          open={open}
          date={date}
          mode="date"
          theme="dark"
          onConfirm={(selectedDate) => {
            setOpen(false);
            const formatted = formatDateForStorage(selectedDate);
            onChange(formatted);
          }}
          onCancel={() => setOpen(false)}
          buttonColor="#ffffff"
          title="Choose date"
          confirmText="Select"
          cancelText="Cancel"
        />

        {!!error && (
          <Text style={{ fontSize: 12, color: '#f02d3a', marginTop: 4, fontFamily: 'Inter-300', maxWidth: 100 }} numberOfLines={1}>
            {error}
          </Text>
        )}
      </View>
    );
  },
);

CustomDatePicker.displayName = 'CustomDatePicker';
export default CustomDatePicker;
