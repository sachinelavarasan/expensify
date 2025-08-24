import { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { FontAwesome } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemedContext';

interface CustomSelectInputProps {
  options: { key: any; value: any }[];
  defaultOption?: { key: any; value: any } | undefined;
  label: string;
  placeholder?: string;
  onChange: (id: number | string) => void;
  value: string | number;
  isRequired?: boolean;
  isSmall?: boolean;
}

export const CustomSelectInput = ({
  options = [],
  label,
  onChange,
  placeholder,
  value,
  isRequired = false,
  isSmall = false,
}: CustomSelectInputProps) => {
  const [selected, setSelected] = useState(value);
  const { colors, theme } = useThemeContext();
  const [defaultOption, setDefaultOption] = useState<{ key: any; value: any } | undefined>();

  useEffect(() => {
    const curr = options.find((opt) => opt.key == value);
    setDefaultOption(curr);
    setSelected(value);
  }, [value, options]);

  return (
    <View style={styles.selectBoxContainer}>
      {label ? (
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <Text style={[styles.labelStyles, { color: colors.title }]}>{label}</Text>
          {isRequired ? (
            <View style={{ marginLeft: 5, marginTop: 5 }}>
              <Image
                source={require('@/assets/icons/required.png')}
                style={{ width: 5, height: 5 }}
              />
            </View>
          ) : null}
        </View>
      ) : null}
      <SelectList
        onSelect={() => onChange(selected)}
        setSelected={setSelected}
        fontFamily={isSmall? "Inter-400": "Inter-500"}
        data={options}
        arrowicon={<FontAwesome name="chevron-down" size={10} color={colors.arrowColor} />}
        search={false}
        boxStyles={{
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.borderColor,
          paddingHorizontal: 12,
          paddingVertical: 10,
          shadowColor: colors.background,
          shadowOffset: {
            width: 0,
            height: 0,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2.84,
          elevation: 1,
          backgroundColor: colors.background,
        }}
        defaultOption={defaultOption}
        dropdownStyles={{
          backgroundColor: theme === 'light' ? colors.background : colors.background,
          borderColor: colors.borderColor,
          borderRadius: 8,
          borderWidth: 1,
          shadowOffset: {
            width: 0,
            height: 0,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2.84,
          elevation: 1,
          shadowColor: theme === 'light' ? '#fff' : '#000',
        }}
        inputStyles={{ color: colors.title, paddingVertical: Platform.OS === 'android' ? 1 : 6 }}
        dropdownTextStyles={{ color: colors.title }}
        maxHeight={150}
        placeholder={placeholder}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  selectBoxContainer: {},
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  boxStyles: {
    borderWidth: 0,
    borderRadius: 6,
    padding: 0,
    backgroundColor: '#1C1C20',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 12,
    fontFamily: 'Inter-300',
    color: '#6E6E80',
  },
  dropdownStyles: { backgroundColor: '#1C1C20', borderWidth: 0 },
  inputStyles: {
    color: '#ffffff',
    paddingVertical: 2,
  },
  dropdownTextStyles: {
    color: '#B3B1C4',
    fontSize: 12,
  },
  labelStyles: {
    fontSize: 12,
    color: '#B3B1C4',
    marginBottom: 6,
    fontFamily: 'Inter-500',
  },
});