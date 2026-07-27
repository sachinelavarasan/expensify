import { StyleSheet, Switch, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useThemeContext } from '@/contexts/ThemedContext';

interface Props {
  value?: boolean;
  onChange?: (data: boolean) => void;
}

const CustomSwitch = ({ value = false, onChange }: Props) => {
  const { colors } = useThemeContext();
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = (value: boolean) => {
    setIsEnabled(value);
    onChange?.(value);
  };
  useEffect(() => {
    setIsEnabled(value);
  }, [value]);
  return (
    <View>
      <Switch
        trackColor={{ false: '#81629e61', true: colors.primary }}
        thumbColor={isEnabled ? '#f5f5f5' : '#574866'}
        onValueChange={toggleSwitch}
        value={isEnabled}
        style={{ transform: [{ scaleX: 1 }, { scaleY: 1 }] }}
      />
    </View>
  );
};

export default CustomSwitch;
