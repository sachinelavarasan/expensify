import React, { useCallback, useEffect, useState } from 'react';
import { Text } from 'react-native';
import { format, parse } from 'date-fns';
import { TimePickerModal } from 'react-native-paper-dates';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';
import RowField from '@/components/RowField';

interface Props {
  value: string;
  onChange: (time: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  label?: string;
  showDivider?: boolean;
}

export default function RowTimePicker({
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  label,
  showDivider,
}: Props) {
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

  const onConfirm = useCallback(
    ({ hours, minutes }: { hours: number; minutes: number }) => {
      setOpen(false);
      const updated = new Date();
      updated.setHours(hours);
      updated.setMinutes(minutes);
      updated.setSeconds(0);
      setTime(updated);
      onChange(format(updated, 'HH:mm'));
    },
    [onChange],
  );

  return (
    <>
      <RowField
        icon={<MaterialIcons name="access-time" size={17} color={colors.primary} />}
        label={label}
        error={error}
        showDivider={showDivider}
        onPress={() => {
          setOpen(true);
          onBlur?.();
        }}
        trailing={<MaterialIcons name="chevron-right" size={20} color={colors.arrowColor} />}>
        <Text style={{ fontSize: FontSize.base, fontFamily: 'Inter-600', color: colors.text }}>
          {formatDisplayTime(time) || placeholder || 'Select Time'}
        </Text>
      </RowField>

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
    </>
  );
}
