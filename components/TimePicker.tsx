import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { format } from 'date-fns';

interface Props {
  value: string;
  onChange: (time: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}

const CustomTimePicker: React.FC<Props> = ({ value, onChange, onBlur, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState<Date>(new Date());

  const formatDisplayTime = (date: Date) => format(date, 'hh:mm a'); // e.g., "10:30 AM"

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setOpen(true);
          onBlur?.();
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
        <Feather name="clock" size={14} color="#fff" style={{ marginRight: 5 }} />
        <Text style={{ color: '#fff', fontWeight: '500', fontFamily: 'Inter-500' }}>
          {value || placeholder || 'Select Time'}
        </Text>
      </TouchableOpacity>

      <DatePicker
        modal
        open={open}
        date={time}
        mode="time"
        theme="dark"
        onConfirm={(selectedTime) => {
          setOpen(false);
          setTime(selectedTime);
          const formatted = formatDisplayTime(selectedTime); // "10:30 AM"
          onChange(formatted);
        }}
        onCancel={() => setOpen(false)}
        buttonColor="#ffffff"
        title="Choose time"
        confirmText="Select"
        cancelText="Cancel"
      />
    </>
  );
};

export default CustomTimePicker;
