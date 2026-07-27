import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { format, parse } from 'date-fns';
import { TimePickerModal } from 'react-native-paper-dates';
import { useThemeContext } from '@/contexts/ThemedContext';

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
  const { colors } = useThemeContext();

  const formatDisplayTime = (date: Date) => format(date, 'hh:mm a');

  useEffect(() => {
    if (!value) {
      const now = new Date();
      const formatted = format(now, 'HH:mm');
      setTime(now);
      onChange(formatted);
    } else {
      const parsedTime = parse(value, 'HH:mm', new Date());
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
      onChange(format(updated, 'HH:mm'));
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
              color: colors.title,
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
          backgroundColor: colors.primary,
          borderWidth: 1,
          paddingHorizontal: 12,
          paddingVertical: 5,
          borderRadius: 20,
          borderColor: 'transparent',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <Feather name="clock" size={14} color={colors.onPrimary} style={{ marginRight: 5 }} />
        <Text style={{ color: colors.onPrimary, fontFamily: 'Inter-500' }}>
          {formatDisplayTime(time) || placeholder || 'Select Time'}
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
};

export default TimePickerPaper;
