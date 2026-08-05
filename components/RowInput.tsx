import React, { forwardRef } from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';
import RowField from '@/components/RowField';

interface Props extends TextInputProps {
  icon?: React.ReactNode;
  label?: string;
  error?: string | null;
  trailing?: React.ReactNode;
  showDivider?: boolean;
  isTextBox?: boolean;
}

const RowInput = forwardRef<TextInput, Props>(function RowInput(
  {
    icon,
    label,
    error,
    trailing,
    showDivider,
    isTextBox,
    style,
    cursorColor,
    selectionColor,
    ...inputProps
  },
  ref,
) {
  const { colors } = useThemeContext();

  return (
    <RowField
      icon={icon}
      label={label}
      error={error}
      trailing={trailing}
      showDivider={showDivider}>
      <TextInput
        ref={ref}
        {...inputProps}
        style={[
          {
            fontSize: FontSize.base,
            fontFamily: 'Inter-600',
            color: colors.text,
            padding: 0,
          },
          isTextBox && { minHeight: 60, textAlignVertical: 'top' },
          style,
        ]}
        placeholderTextColor={colors.inputPlaceholder}
        selectionColor={selectionColor ?? colors.primary + '40'}
        cursorColor={cursorColor ?? colors.secondary}
        autoCorrect={false}
        spellCheck={false}
      />
    </RowField>
  );
});

export default RowInput;
