import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { format, parse } from 'date-fns';
import { TimePickerModal } from 'react-native-paper-dates';

interface Props {
  value: string;
  onChange: (time: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  isRequired?: boolean;
  label?: string;
}

const TimePickerPaper = ({
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

  const formatDisplayTime = (date: Date) => format(date, 'hh:mm a');

  useEffect(() => {
    if (!value) {
      const now = new Date();
      const formatted = formatDisplayTime(now);
      setTime(now);
      onChange(formatted);
    } else {
      const parsedTime = parse(value, 'hh:mm a', new Date());
      if (!isNaN(parsedTime.getTime())) {
        setTime(parsedTime);
      }
    }
  }, [onChange, value]);

  const onDismiss = () => setOpen(false);

  const onConfirm = React.useCallback(
    ({ hours, minutes }: { hours: number; minutes: number }) => {
      setOpen(false);
      const updated = new Date();
      updated.setHours(hours);
      updated.setMinutes(minutes);
      updated.setSeconds(0);
      setTime(updated);
      onChange(formatDisplayTime(updated));
    },
    [setOpen],
  );

  return (
    <View>
      {label && (
        <View style={{ flexDirection: 'row' }}>
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
      )}

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

      <TimePickerModal
        visible={open}
        onDismiss={onDismiss}
        onConfirm={onConfirm}
        hours={time.getHours()}
        minutes={time.getMinutes()}
        label={value}
        defaultInputType="picker"
        use24HourClock
        uppercase={true}
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

export default TimePickerPaper;
