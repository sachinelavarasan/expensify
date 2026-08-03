import { useThemeContext } from '@/contexts/ThemedContext';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { RadioButton } from 'react-native-radio-buttons-group';

interface CustomRadioButtonProps {
  options: { id: any; label: string }[];
  onChange: (id: number | string) => void;
  value: number | string;
  label?: string;
  disabled?: boolean;
  isRequired?: boolean;
  isColumn?: boolean;
  // Wraps options into a fixed-width 2-column grid instead of a single row -
  // for option sets that no longer fit on one line in a narrower container
  // (e.g. a 4-way filter inside a modal card).
  grid?: boolean;
}

export default function CustomRadioButton({
  options,
  onChange,
  value,
  label,
  disabled,
  isRequired = false,
  isColumn = false,
  grid = false,
}: CustomRadioButtonProps) {
  const { colors } = useThemeContext();
  const [selectedId, setSelectedId] = useState<string | number | undefined>(value);
  useEffect(() => {
    if (value) {
      setSelectedId(value);
    }
  }, [value]);

  function handlePress(id: string | number) {
    onChange(id);
    setSelectedId(id);
  }

  return (
    <>
      {label ? (
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <Text
            style={[
              { fontSize: 12, color: colors.text, marginVertical: 3, fontFamily: 'Inter-500' },
            ]}>
            {label}
          </Text>
          {/* {isRequired ? (
            <View style={{ marginLeft: 5, marginTop: 5 }}>
              <Image
                source={require('@/assets/icons/required.png')}
                style={{ width: 8, height: 8 }}
              />
            </View>
          ) : null} */}
        </View>
      ) : null}

      <View
        style={[
          styles.container,
          isColumn && {
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
          },
          grid && styles.gridContainer,
        ]}>
        {options.map((button, index) => (
          <RadioButton
            {...button}
            key={button.id}
            labelStyle={[styles.labelStyle, { color: colors.title }]}
            selected={button.id == selectedId}
            onPress={handlePress}
            borderColor={colors.primary}
            color={colors.primary}
            containerStyle={grid ? styles.gridItem : { marginHorizontal: 0 }}
            disabled={disabled}
          />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  gridContainer: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    rowGap: 10,
  },
  gridItem: {
    marginHorizontal: 0,
    width: '47%',
  },
  labelStyle: {
    fontSize: 14,
    fontFamily: 'Inter-500',
  },
});
