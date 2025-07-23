import { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { FontAwesome } from '@expo/vector-icons';

interface CustomSelectInputProps {
  options: { key: any; value: any }[];
  defaultOption?: { key: any; value: any } | undefined;
  label: string;
  placeholder?: string;
  onChange: (id: number | string) => void;
  value: string | number;
  isRequired?: boolean;
}

export const CustomSelectInput = ({
  options = [],
  label,
  onChange,
  placeholder,
  value,
  isRequired = false,
}: CustomSelectInputProps) => {
  const [selected, setSelected] = useState(value);
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
          <Text style={styles.labelStyles}>{label}</Text>
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
      <SelectList
        onSelect={() => onChange(selected)}
        setSelected={setSelected}
        fontFamily="Inter-500"
        data={options}
        arrowicon={<FontAwesome name="chevron-down" size={16} color={'#6E6E80'} />}
        search={false}
        boxStyles={styles.boxStyles} // Apply custom styles
        defaultOption={defaultOption} //default selected option
        dropdownStyles={styles.dropdownStyles}
        inputStyles={styles.inputStyles}
        dropdownTextStyles={styles.dropdownTextStyles}
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
    fontSize: 16,
    fontFamily: 'Inter-300',
    color: '#6E6E80',
  },
  dropdownStyles: { backgroundColor: '#1C1C20', borderWidth: 0 },
  inputStyles: {
    color: '#6E6E80',
    paddingVertical: Platform.OS === 'android' ? 1 : 6,
  },
  dropdownTextStyles: {
    color: '#6E6E80',
  },
  labelStyles: {
    fontSize: 16,
    color: '#7A7A8C',
    marginBottom: 6,
    fontFamily: 'Inter-400',
  },
});
