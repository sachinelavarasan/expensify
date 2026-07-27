import React, { useState, forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemedContext';

interface ExtraInputProps {
  label?: string;
  borderLess?: boolean;
  isTextBox?: boolean;
  isPassword?: boolean;
  error?: string | null;
  isTitle?: boolean;
  isRequired?: boolean;
}

const Input = forwardRef(function MyInput(
  props: ExtraInputProps & TextInputProps,
  ref: React.Ref<TextInput>,
) {
  const { colors } = useThemeContext();
  const [inputHeight, setInputHeight] = useState(0);
  const {
    label,
    borderLess,
    isTextBox,
    isPassword,
    error,
    isTitle,
    editable = true,
    isRequired = false,
    ...otherProps
  } = props;
  const [show, setShow] = useState(false);
  return (
    <View style={{position:'relative'}} onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}>
      {label ? (
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <Text style={[styles.label, { color: colors.title }]}>{label}</Text>
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
          styles.inputContainer,
          {
            backgroundColor: colors.background,
          },
          borderLess ? [styles.borderNone, { backgroundColor: colors.inputColor }] : null,
          !editable ? { opacity: 0.7 } : null,
        ]}>
        <View
          style={[
            styles.innerView,
            {
              borderColor: error ? colors.expense : colors.inputBorder,
              borderRadius: 8,
              borderWidth: 1,
            },
          ]}>
          <TextInput
            ref={ref}
            {...otherProps}
            style={[
              styles.input,
              {
                backgroundColor:  colors.inputColor,
                color: colors.text,
              },
              isTitle ? styles.titleText : null,
              isTextBox ? styles.textBox : null,
            ]}
            secureTextEntry={isPassword && !show}
            autoCorrect={false}
            autoComplete={'off'}
            selectTextOnFocus={false}
            autoCapitalize="none"
            spellCheck={false}
            placeholderTextColor={colors.inputPlaceholder}
            selectionColor={colors.text}
            cursorColor={colors.secondary}
            editable={editable}
          />
          {isPassword ? (
            <TouchableOpacity onPress={() => setShow((state) => !state)}>
              {show ? (
                <Ionicons style={styles.inputIconPassword} name="eye" color={colors.lighterTitle} size={18} />
              ) : (
                <Ionicons
                  style={styles.inputIconPassword}
                  name="eye-off"
                  color={colors.lighterTitle}
                  size={18}
                />
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      {error ? (
        <Text style={[styles.error, { top: inputHeight + 0, color: colors.expense }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 0,
  },
  textBox: {
    height: 130,
    paddingVertical: Platform.OS === 'android' ? 12 : 16,
    paddingHorizontal: 20,
    textAlignVertical: 'top',
  },
  innerView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 5,
    fontSize: 16,
    fontFamily: 'Inter-400',
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent'
    // shadowOffset: {
    //   width: 0,
    //   height: 0,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 2.84,
    // elevation: 1,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontFamily: 'Inter-500',
  },
  error: {
    fontSize: 12,
    position: 'absolute',
    fontFamily: 'Inter-300',
    letterSpacing: 0.5,
  },
  inputIconPassword: {
    height: 20,
    width: 20,
    marginRight: 12,
  },
  borderNone: {
    borderWidth: 0,
    borderRadius: 6,
  },
  titleText: {
    fontSize: 15,
    fontFamily: 'Inter-500',
  },
});
