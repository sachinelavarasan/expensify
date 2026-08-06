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
  enableAutofill?: boolean;
  rightIcon?: React.ReactNode;
  // Drops the field's own bordered/background box in favor of sitting
  // directly on whatever container it's placed in - for use inside an
  // already-bordered card, where a box-in-a-box look would be redundant.
  flat?: boolean;
  // Tints the field's fill/border with colors.primary instead of the
  // neutral inputColor/inputBorder pair - opt-in so every other screen's
  // fields are unaffected.
  tint?: boolean;
  // Fixes the field to an exact height instead of letting paddingVertical
  // drive it - opt-in so existing screens keep their current sizing.
  height?: number;
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
    enableAutofill = false,
    rightIcon,
    flat = false,
    tint = false,
    height,
    onFocus,
    onBlur,
    autoComplete,
    ...otherProps
  } = props;
  const fieldBg = tint ? `${colors.primary}09` : colors.inputColor;
  const fieldBorder = tint ? `${colors.primary}66` : colors.inputBorder;
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={{ position: 'relative' }}
      onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}>
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
          borderLess ? [styles.borderNone, { backgroundColor: fieldBg }] : null,
          !editable ? { opacity: 0.7 } : null,
        ]}>
        <View
          style={[
            styles.innerView,
            flat
              ? { borderWidth: 0, backgroundColor: 'transparent' }
              : {
                  borderColor: error
                    ? colors.expense
                    : focused
                      ? colors.borderSelected
                      : fieldBorder,
                  backgroundColor: fieldBg,
                  borderRadius: 8,
                  borderWidth: 1,
                },
            height ? { height } : null,
          ]}>
          <TextInput
            ref={ref}
            {...otherProps}
            style={[
              styles.input,
              {
                color: colors.text,
              },
              isTitle ? styles.titleText : null,
              isTextBox ? styles.textBox : null,
              flat ? styles.inputFlat : null,
              height ? { paddingVertical: 0 } : null,
            ]}
            secureTextEntry={isPassword && !show}
            autoCorrect={false}
            autoComplete={enableAutofill ? autoComplete : 'off'}
            importantForAutofill={enableAutofill ? 'yes' : 'no'}
            selectTextOnFocus={false}
            autoCapitalize="none"
            spellCheck={false}
            placeholderTextColor={colors.inputPlaceholder}
            selectionColor={colors.primary + '40'}
            cursorColor={colors.secondary}
            editable={editable}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
          />
          {isPassword ? (
            <TouchableOpacity onPress={() => setShow((state) => !state)}>
              {show ? (
                <Ionicons
                  style={styles.inputIconPassword}
                  name="eye"
                  color={colors.lighterTitle}
                  size={18}
                />
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
          {rightIcon}
        </View>
      </View>
      {error ? (
        <Text style={[styles.error, { top: inputHeight + 0, color: colors.expense }]}>{error}</Text>
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
    paddingVertical: Platform.OS === 'android' ? 8 : 16,
    fontSize: 16,
    fontFamily: 'Inter-400',
    paddingHorizontal: 20,
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
  inputFlat: {
    paddingHorizontal: 0,
  },
  titleText: {
    fontSize: 15,
    fontFamily: 'Inter-500',
  },
});
