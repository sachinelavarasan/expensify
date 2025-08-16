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
}

export default function CustomRadioButton({
  options,
  onChange,
  value,
  label,
  disabled,
  isRequired = false,
  isColumn = false,
}: CustomRadioButtonProps) {
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
              { fontSize: 14, color: '#282343', marginVertical: 3, fontFamily: 'Inter-500' },
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
        ]}>
        {options.map((button, index) => (
          <RadioButton
            {...button}
            key={button.id}
            labelStyle={styles.labelStyle}
            selected={button.id == selectedId}
            onPress={handlePress}
            borderColor="#6B5DE6"
            color="#6B5DE6"
            containerStyle={{ marginHorizontal: 0 }}
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
  labelStyle: {
    fontSize: 14,
    color: '#1E1E1E',
    fontFamily: 'Inter-500',
  },
});
