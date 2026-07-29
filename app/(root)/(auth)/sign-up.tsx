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
} from 'react-native';
import { useRouter } from 'expo-router';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import Input from '@/components/Input';
import Spacer from '@/components/Spacer';
import AuthLink from '@/components/AuthLink';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import FormErrorBanner from '@/components/FormErrorBanner';

import { apiClient, getApiErrorMessage } from '@/lib/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/ThemedView';
import { useThemeContext } from '@/contexts/ThemedContext';

const schema = z.object({
  name: z.string().min(3, { message: 'Name should have a minimum 3 characters' }),
  password: z
    .string()
    .min(8, { message: 'Password should have a minimum 8 characters' })
    .max(16, { message: 'Password should have a maximum 16 characters' }),
  email: z.email({ message: 'Invalid email address' }),
});

type SignUpForm = z.infer<typeof schema>;

const Register = () => {
  const router = useRouter();
  const { colors } = useThemeContext();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
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
    },
    resolver: zodResolver(schema),
  });

  const register = async (data: SignUpForm) => {
    setIsLoading(true);
    setServerError(null);
    try {
      await apiClient.post('/expensify/auth/signup', data);
      await AsyncStorage.setItem('current-verify-email', data.email);
      setIsLoading(false);
      router.dismissTo('/(root)/(auth)/mobile-verify');
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Could not create your account'));
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
                  Join <Text style={{ color: colors.primary }}>Expensify</Text> 👋
                </Text>
                <Text style={[styles.subtext, { color: colors.description }]}>
                  Start tracking your income and expenses in seconds
                </Text>
              </View>
              <Spacer height={25} />
              <View style={styles.loginContainer}>
                <FormErrorBanner message={serverError} />
                {!!serverError && <Spacer height={16} />}
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
                      placeholder="Enter your email address"
                      label="Email address"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      enableAutofill
                      autoComplete="email"
                      textContentType="emailAddress"
                      onBlur={field.onBlur}
                      onChangeText={field.onChange}
                      error={errors.email?.message}
                      borderLess
                    />
                  )}
                  name="email"
                />
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
                      enableAutofill
                      autoComplete="new-password"
                      textContentType="newPassword"
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
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 14,
    fontFamily: 'Inter-400',
    paddingTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Register;
