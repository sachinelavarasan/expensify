import { StyleSheet, Switch, View } from 'react-native';
import React, { useEffect, useState } from 'react';

interface Props {
  value?: boolean;
  onChange?: (data: boolean) => void;
}

const CustomSwitch = ({ value = false, onChange }: Props) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = (value: boolean) => {
    setIsEnabled(value);
    onChange?.(value)
  };
  useEffect(() => {
    setIsEnabled(value);
  }, [value]);
  return (
    <View>
      <Switch
        trackColor={{ false: '#81629e61', true: '#6900FF' }}
        thumbColor={isEnabled ? '#f5f5f5' : '#574866'}
        onValueChange={toggleSwitch}
        value={isEnabled}
        style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
      />
    </View>
  );
};

export default CustomSwitch;

const styles = StyleSheet.create({});
