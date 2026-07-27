import { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  error?: string | null;
  clearable?: boolean;
}

export const CustomSelectInput = ({
  options = [],
  label,
  onChange,
  placeholder,
  value,
  isRequired = false,
  isSmall = false,
  error,
  clearable = false,
}: CustomSelectInputProps) => {
  const [selected, setSelected] = useState(value);
  const { colors, theme } = useThemeContext();
  const [defaultOption, setDefaultOption] = useState<{ key: any; value: any } | undefined>();
  // Bumped on clear to force SelectList to remount - it only reflects prop
  // changes back into its own displayed text on mount/defaultOption change,
  // so resetting `value` alone wouldn't clear the text it shows.
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const curr = options.find((opt) => opt.key == value);
    setDefaultOption(curr);
    setSelected(value);
  }, [value, options]);

  const handleClear = () => {
    setSelected('');
    setDefaultOption(undefined);
    onChange('');
    setResetKey((k) => k + 1);
  };

  return (
    <View style={styles.selectBoxContainer}>
      {label ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
          {clearable && !!selected && (
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Text style={[styles.clearText, { color: colors.expense }]}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
      <SelectList
        key={resetKey}
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
          borderColor: error ? colors.expense :colors.inputBorder,
          paddingHorizontal: 12,
          paddingVertical: 10,
          shadowColor: colors.inputColor,
          shadowOffset: {
            width: 0,
            height: 0,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2.84,
          elevation: 1,
          backgroundColor: colors.inputColor,
        }}
        defaultOption={defaultOption}
        dropdownStyles={{
          backgroundColor: colors.inputColor,
          borderColor: colors.inputBorder,
          borderRadius: 8,
          borderWidth: 1,
          shadowOffset: {
            width: 0,
            height: 0,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2.84,
          elevation: 1,
          shadowColor: colors.inputColor,
        }}
        inputStyles={{ color: selected? colors.title: colors.inputPlaceholder, paddingVertical: Platform.OS === 'android' ? 1 : 6 }}
        dropdownTextStyles={{ color: colors.title }}
        maxHeight={150}
        placeholder={placeholder}
      />
      {error ? <Text style={[styles.error, { color: colors.expense }]}>{error}</Text> : null}
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
  labelStyles: {
    fontSize: 12,
    marginBottom: 6,
    fontFamily: 'Inter-500',
  },
  clearText: {
    fontSize: 12,
    marginBottom: 6,
    fontFamily: 'Inter-600',
  },
   error: {
    fontSize: 12,
    bottom: 0,
    position: 'absolute',
    marginBottom: -20,
    fontFamily: 'Inter-300',
    letterSpacing: 0.5,
  },
});