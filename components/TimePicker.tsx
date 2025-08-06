import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { format, parse, parseISO } from 'date-fns';

interface Props {
  value: string;
  onChange: (time: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  isRequired?: boolean;
  label?: string;
}

const CustomTimePicker = ({
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  isRequired,
  label,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    if (!value) {
      const now = new Date();
      const formatted = formatDisplayTime(now);
      setTime(now);
      onChange(formatted);
    } else {
      const parsedTime = parse(value, 'hh:mm a', new Date());
      setTime(parsedTime);
    }
  }, [onChange, value]);

  const formatDisplayTime = (date: Date) => format(date, 'hh:mm a');

  return (
    <View>
      {label ? (
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <Text
            style={{
              fontSize: 14,
              color: '#B3B1C4',
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
          const formatted = formatDisplayTime(selectedTime);
          onChange(formatted);
        }}
        onCancel={() => setOpen(false)}
        buttonColor="#ffffff"
        title="Choose time"
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
};

export default CustomTimePicker;
