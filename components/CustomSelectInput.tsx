import { useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { FontAwesome } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemedContext';

interface Option {
  key: any;
  value: any;
}

interface CustomSelectInputProps {
  options: Option[];
  defaultOption?: Option | undefined;
  label: string;
  placeholder?: string;
  onChange: (id: number | string) => void;
  value: string | number;
  isRequired?: boolean;
  isSmall?: boolean;
  error?: string | null;
  clearable?: boolean;
  search?: boolean | undefined;
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
  search = true,
}: CustomSelectInputProps) => {
  const { colors } = useThemeContext();
  const popupBackgroundColor = colors.cardBg;
  const [focused, setFocused] = useState(false);

  const handleClear = () => {
    onChange('');
  };

  return (
    <View style={styles.selectBoxContainer}>
      {label ? (
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
          {clearable && !!value && (
            <TouchableOpacity
              onPress={handleClear}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Text style={[styles.clearText, { color: colors.expense }]}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
      <Dropdown
        mode="default"
        data={options}
        labelField="value"
        valueField="key"
        value={value}
        onChange={(item) => onChange(item.key)}
        activeColor={`${colors.primary}26`}
        fontFamily={isSmall ? 'Inter-400' : 'Inter-500'}
        renderRightIcon={() => (
          <FontAwesome name="chevron-down" size={10} color={colors.arrowColor} />
        )}
        disable={options.length === 0}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        search={search}
        searchField="value"
        searchPlaceholder="Search..."
        searchPlaceholderTextColor={colors.inputPlaceholder}
        inputSearchStyle={{
          borderRadius: 8,
          borderColor: colors.inputBorder,
          color: colors.title,
          fontSize: 16,
          fontFamily: 'Inter-400',
        }}
        dropdownPosition="auto"
        placeholder={options.length === 0 ? 'No options available' : placeholder}
        placeholderStyle={{
          color: colors.inputPlaceholder,
        }}
        selectedTextStyle={{
          color: colors.title,
          fontSize: 16,
          fontFamily: 'Inter-400',
        }}
        itemTextStyle={{ color: colors.title, fontSize: 16, fontFamily: 'Inter-400' }}
        itemContainerStyle={{ backgroundColor: popupBackgroundColor }}
        style={{
          padding: 0,
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: error
            ? colors.expense
            : focused
              ? colors.borderSelected
              : colors.inputBorder,
          paddingHorizontal: 20,
          paddingVertical: Platform.OS === 'android' ? 8 : 16,
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
        containerStyle={{
          backgroundColor: popupBackgroundColor,
          borderColor: colors.inputBorder,
          borderRadius: 8,
          borderWidth: 1,
          overflow: 'hidden',
          shadowOffset: {
            width: 0,
            height: 0,
          },
          marginTop: -50,
          shadowOpacity: 0.1,
          shadowRadius: 2.84,
          elevation: 1,
          shadowColor: popupBackgroundColor,
        }}
        maxHeight={180}
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
