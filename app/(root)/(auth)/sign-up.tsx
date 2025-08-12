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

// import { useAppDispatch, useAppSelector } from '@/redux/hooks';
// import { setError, signUp } from '@/redux/slices/auth/authSlice';

import { phoneValidation } from '@/utils/Validation-custom';
import { isClerkAPIResponseError, useSignUp } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const schema = z.object({
  name: z.string().min(3, { message: 'Minimum 3 characters' }),
  password: z.string().min(8, { message: 'Minimum 8 characters' }).max(16, { message: 'Maximun 16 characters' }),
  phone: z
    .string()
    .min(1, { message: 'Must have at least 1 character' })
    .regex(phoneValidation, { message: 'invalid phone number' }),
});

type SignUpForm = z.infer<typeof schema>;

const Register = () => {
  const router = useRouter();
  const { signUp, isLoaded: isLoadedSignUp } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      password: '',
    },
    resolver: zodResolver(schema),
  });

  const register = async (data: SignUpForm) => {
    if (!isLoadedSignUp) return;
    setIsLoading(true);
    try {
      await signUp.create({
        phoneNumber: data.phone,
        firstName: data.name,
        password: data.password,
      });

      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
      setIsLoading(false);
      await AsyncStorage.setItem('current-verify-number', data.phone);
      router.dismissTo('/(root)/(auth)/mobile-verify');
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      if (isClerkAPIResponseError(err)) {
        const errorCode = err.errors[0]?.code;
        switch (errorCode) {
          case 'form_phone_number_invalid':
            Alert.alert('Error', 'The phone number is invalid. Please check and try again.');
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
            Alert.alert('Error', 'An error occurred during sign-up.');
            break;
        }
      } else {
        Alert.alert('Error', 'An error occurred during sign-up.');
      }
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
      style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flex: 1 }}
          keyboardShouldPersistTaps={'always'}>
          <View style={styles.container}>
            <View style={styles.formContainer}>
              {/* {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.error}>{error}</Text>
                </View>
              )} */}
              <View style={styles.imageContainer}>
                {/* <Image
                source={require('@/assets/images/app-screen-icon.png')}
                style={styles.image}
                resizeMode="contain"
              /> */}
                <Text style={styles.label}>Create your account</Text>
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
                <Spacer height={20} />
                {/* <Controller
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Email"
                      label="Email"
                      keyboardType="email-address"
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
                <Spacer height={20} /> */}
                <Controller
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="+91XXXXXXXXXX"
                      label="Phone no"
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
                />
                <Spacer height={20} />
                <Controller
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Password"
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
                    style={[styles.button, !isValid || isLoading ? styles.disable : {}]}
                    onPress={handleSubmit(register)}
                    disabled={!isValid || isLoading}>
                    {isLoading ? (
                      <ActivityIndicator animating color={'#FFF'} style={styles.loader} />
                    ) : null}
                    <Text style={[styles.title, isLoading ? styles.textDisable : {}]}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
                <Spacer height={50} />
                <AuthLink
                  linkText="Sign In"
                  description="Already have an account? "
                  onPress={() => {
                    router.replace('/login');
                  }}
                />
                <Spacer height={50} />
                {/* <OTPTextInput
                  ref={otpInput}
                  inputCount={6}
                  containerStyle={styles.textInputContainer}
                  textInputStyle={styles.roundedTextInput}
                  inputCellLength={1} tintColor="#FFCA3A" offTintColor="#ffca3a87"
                  keyboardType='numeric'
                  autoFocus={true}></OTPTextInput> */}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaViewComponent>
    </KeyboardAvoidingView>
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
    backgroundColor: '#463e75',
    borderRadius: 8,
    paddingVertical: 10,
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

export default Register;
