import React from 'react';
import { StyleProp, TextProps, ViewStyle } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { useThemeContext } from '@/contexts/ThemedContext';

interface CustomCheckBoxProps {
  label?: string;
  disabled?: boolean;
  fillColor?: string;
  unFillColor?: string;
  innerIconStyle?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextProps>;
  onChange: (checked: boolean) => void;
  isChecked: boolean;
  size?: number;
}

export default function CustomCheckBox({
  label,
  disabled,
  fillColor,
  onChange,
  isChecked,
  size,
}: CustomCheckBoxProps) {
  const { colors } = useThemeContext();
  return (
    <BouncyCheckbox
      size={size || 24}
      fillColor={fillColor}
      unFillColor="transparent"
      text={label}
      innerIconStyle={{ borderWidth: 1, borderRadius: 4 }}
      iconStyle={{ borderRadius: 4 }}
      textStyle={{ fontFamily: 'Inter-400', textDecorationLine: 'none', color: colors.lighterTitle }}
      disabled={disabled}
      onPress={(checked: boolean) => {
        onChange(checked);
      }}
      isChecked={isChecked}
    />
  );
}
