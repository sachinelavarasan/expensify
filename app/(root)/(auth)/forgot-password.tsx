import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { isClerkAPIResponseError, useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import AuthLink from '@/components/AuthLink';
import Input from '@/components/Input';
import Spacer from '@/components/Spacer';
import { ThemedView } from '@/components/ThemedView';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { phoneValidation } from '@/utils/Validation-custom';
import { Controller, useForm } from 'react-hook-form';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import { useThemeContext } from '@/contexts/ThemedContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '@/components/ToastMessage';

const schema = z.object({
  email: z.email({ message: 'Invalid email address' }),
});

type ForgotPasswordForm = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();
  const { colors } = useThemeContext();

  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(schema),
  });

  const onResetPasswordPress = async (data: ForgotPasswordForm) => {
    if (!isLoaded) return;

    setIsLoading(true);

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: data.email,
      });
      setIsLoading(false);
      showToast({
        text1: 'Your reset password request sent successfully',
        type: 'info',
        position: 'bottom',
        visibilityTime: 3000,
      });
      await AsyncStorage.setItem('current-verify-email', data.email);
      router.dismissTo('/(root)/(auth)/change-password');
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      if (isClerkAPIResponseError(err)) {
        const errorCode = err.errors[0]?.code;
        switch (errorCode) {
          case 'form_phone_number_invalid':
            Alert.alert('Error', 'The phone number is invalid. Please check and try again.');
            break;
          case 'form_identifier_not_found':
            Alert.alert('Error', 'User not found. Please check your phone number.');
            break;
          case 'form_param_nil':
            Alert.alert('Error', 'Required parameter is missing');
            break;
          case 'form_phone_number_already_verified':
            Alert.alert('Error', 'This phone number is already registered.');
            break;
          case 'form_param_format_invalid':
            Alert.alert(
              'Error',
              'Please enter a valid phone number including the correct country code.',
            );
            break;
          case 'form_password_too_weak':
            Alert.alert('Error', 'Password is too weak. Please use a stronger password.');
            break;
          case 'form_password_invalid':
            Alert.alert('Error', 'Invalid password format.');
            break;
          case 'form_rate_limited':
            Alert.alert('Error', 'Too many attempts. Please try again later.');
            break;
          case 'form_identifier_exists':
            Alert.alert('Error', 'Given phone number already exists');
            break;
          case 'form_password_validation_failed':
            Alert.alert('Error', 'Password validation failed. Please try again.');
            break;
          case 'form_password_pwned':
            Alert.alert('Error', 'This password has been exposed before. Please choose another');
            break;
          case 'form_internal_error':
            Alert.alert('Error', 'Internal error occurred. Please try again later.');
            break;
          default:
            Alert.alert('Error', JSON.stringify(err, null, 2));
            break;
        }
      } else {
        Alert.alert('Error', JSON.stringify(err, null, 2));
      }
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaViewComponent>
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          {...(Platform.OS === 'ios' ? { behavior: 'padding' } : { behavior: 'height' })}
          style={{ flex: 1 }}>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flex: 1 }}
            keyboardShouldPersistTaps={'always'}>
            <View style={styles.formContainer}>
              <View style={styles.imageContainer}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: colors.title,
                    },
                  ]}>
                  Forgot Password
                </Text>
              </View>
              <Spacer height={35} />
              <View style={styles.loginContainer}>
                <Controller
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter your email address"
                      label="Email address"
                      keyboardType="numbers-and-punctuation"
                      autoCapitalize="none"
                      autoComplete="off"
                      onBlur={field.onBlur}
                      onChangeText={field.onChange}
                      error={errors.email?.message}
                      borderLess
                    />
                  )}
                  name="email"
                />

                <Spacer height={40} />
                <View style={styles.btnContainer}>
                  <TouchableOpacity
                    style={[styles.button, !isValid || isLoading ? styles.disable : {}]}
                    onPress={handleSubmit(onResetPasswordPress)}
                    disabled={!isValid || isLoading}>
                    {isLoading ? (
                      <ActivityIndicator animating color={'#FFF'} style={styles.loader} />
                    ) : null}
                    <Text style={[styles.title, isLoading ? styles.textDisable : {}]}>
                      Send Verification Code
                    </Text>
                  </TouchableOpacity>
                </View>
                <Spacer height={50} />
                <AuthLink
                  disabled={isLoading}
                  linkText="Sign In"
                  description="Back to Login"
                  onPress={() => {
                    router.replace('/login');
                  }}
                />
                <Spacer height={50} />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaViewComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: 200,
    width: 200,
  },
  loginContainer: {
    justifyContent: 'center',
    paddingHorizontal: 35,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 150,
  },
  btnContainer: {
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#6B5DE6',
    borderRadius: 8,
    paddingVertical: 8,
    width: '100%',
  },
  loader: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter-600',
  },
  disable: {
    opacity: 0.4,
  },
  textDisable: { opacity: 0 },
  errorContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    display: 'flex',
    width: '100%',
    paddingTop: 20,
    paddingBottom: 10,
  },
  error: {
    fontSize: 14,
    color: '#f02d3a',
    fontFamily: 'Inter-500',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: 'Inter-800',
  },
});
