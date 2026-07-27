import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import Input from '@/components/Input';
import Spacer from '@/components/Spacer';
import AuthLink from '@/components/AuthLink';
import SafeAreaViewComponent from '@/components/SafeAreaView';

import { isClerkAPIResponseError, useSignUp } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/ThemedView';
import { useThemeContext } from '@/contexts/ThemedContext';

const usernameValidation = /^[a-z0-9]{6,25}$/;

const schema = z.object({
  name: z.string().min(3, { message: 'Name should have a minimum 3 characters' }),
  password: z
    .string()
    .min(8, { message: 'Password should have a minimum 8 characters' })
    .max(16, { message: 'Password should have a maximum 16 characters' }),
  email: z.email({ message: 'Invalid email address' }),
  username: z
    .string()
    .min(6, { message: 'Username should have a minimum 6 characters' })
    .max(25, { message: 'Username should have a maximum 25 characters' })
    .refine((val) => usernameValidation.test(val), {
      message: 'Username must contain only lowercase letters and numbers (between 6 to 25 chars).',
    }),
});

type SignUpForm = z.infer<typeof schema>;

const Register = () => {
  const router = useRouter();
  const { colors } = useThemeContext();
  const { signUp, isLoaded: isLoadedSignUp } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      password: '',
      email: '',
      username: '',
    },
    resolver: zodResolver(schema),
  });

  const register = async (data: SignUpForm) => {
    if (!isLoadedSignUp) return;
    setIsLoading(true);
    try {
      await signUp.create({
        emailAddress: data.email,
        firstName: data.name,
        password: data.password,
        username: data.username,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setIsLoading(false);
      await AsyncStorage.setItem('current-verify-email', data.email);
      router.dismissTo('/(root)/(auth)/mobile-verify');
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      if (isClerkAPIResponseError(err)) {
        const errorCode = err.errors[0]?.code;
        switch (errorCode) {
          case 'form_param_nil':
            Alert.alert('Error', 'Required parameter is missing');
            break;
          case 'form_param_format_invalid':
            Alert.alert('Error', 'Please enter a valid email address');
            break;
          case 'form_password_too_weak':
            Alert.alert('Error', 'Password is too weak. Please use a stronger password.');
            break;
          case 'form_password_invalid':
            Alert.alert('Error', 'Invalid password format.');
            break;
          case 'form_first_name_missing':
            Alert.alert('Error', 'First name is required.');
            break;
          case 'form_rate_limited':
            Alert.alert('Error', 'Too many attempts. Please try again later.');
            break;
          case 'form_password_length_too_short':
            Alert.alert('Error', 'Passwords must be 8 characters or more.');
            break;
          case 'form_password_length_too_long':
            Alert.alert('Error', 'Password length is too long');
            break;
          case 'form_identifier_exists':
            Alert.alert('Error', 'Given email address already exists');
            break;
          case 'form_password_validation_failed':
            Alert.alert('Error', 'Password validation failed. Please try again.');
            break;
          case 'form_password_pwned':
            Alert.alert('Error', 'This password has been exposed before. Please choose another');
            break;
          case 'form_username_invalid_character':
            Alert.alert('Error', 'Username contains invalid characters (only number,letters)');
            break;
          case 'form_username_invalid_length':
            Alert.alert('Error', 'Username must contains min 8 or max 20 character');
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
                  Create your account 👋
                </Text>
              </View>
              <Spacer height={25} />
              <View style={styles.loginContainer}>
                <Controller
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Name"
                      label="Name"
                      keyboardType="default"
                      autoCapitalize="none"
                      autoComplete="off"
                      onBlur={field.onBlur}
                      onChangeText={field.onChange}
                      error={errors.name?.message}
                      borderLess
                    />
                  )}
                  name="name"
                />
                <Spacer height={30} />

                <Controller
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Username"
                      keyboardType="numbers-and-punctuation"
                      autoCapitalize="none"
                      autoComplete="off"
                      onBlur={field.onBlur}
                      onChangeText={field.onChange}
                      error={errors.username?.message}
                      borderLess
                    />
                  )}
                  name="username"
                />
                <Spacer height={30} />
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
                {/* <Spacer height={20} />
                <Controller
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Mobile Number"
                      label="Phone number"
                      keyboardType="numbers-and-punctuation"
                      autoCapitalize="none"
                      autoComplete="off"
                      onBlur={field.onBlur}
                      onChangeText={field.onChange}
                      error={errors.phone?.message}
                      borderLess
                    />
                  )}
                  name="phone"
                /> */}
                <Spacer height={30} />
                <Controller
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter your password"
                      label="Password"
                      autoCapitalize="none"
                      isPassword
                      onBlur={field.onBlur}
                      onChangeText={field.onChange}
                      error={errors.password?.message}
                      borderLess
                    />
                  )}
                  name="password"
                />
                <Spacer height={35} />
                <View style={styles.btnContainer}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      { backgroundColor: colors.primary },
                      isLoading ? styles.disable : {},
                    ]}
                    onPress={handleSubmit(register)}
                    disabled={isLoading}>
                    {isLoading ? (
                      <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
                    ) : null}
                    <Text
                      style={[
                        styles.title,
                        { color: colors.onPrimary },
                        isLoading ? styles.textDisable : {},
                      ]}>
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
                <Spacer height={50} />
                <AuthLink
                  disabled={isLoading}
                  linkText="Sign In"
                  description="Already have an account? "
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    display: 'flex',
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
    justifyContent: 'center',
  },
  btnContainer: {
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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
  label: {
    fontSize: 24,
    marginBottom: 2,
    fontFamily: 'Inter-800',
  },
});

export default Register;
