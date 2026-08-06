import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Input from '@/components/Input';
import Spacer from '@/components/Spacer';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import FormErrorBanner from '@/components/FormErrorBanner';

import AuthLink from '@/components/AuthLink';
import { apiClient, getApiErrorCode, getApiErrorMessage } from '@/lib/apiClient';
import { useAuthContext } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { useThemeContext } from '@/contexts/ThemedContext';
import { showToast } from '@/components/ToastMessage';

const schema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type SignInForm = z.infer<typeof schema>;

export default function SignIn() {
  const { colors } = useThemeContext();
  const router = useRouter();
  const { signIn } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: SignInForm) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const response = await apiClient.post('/expensify/auth/login', data);
      await signIn(response.data);
      reset();
      router.dismissTo('/(root)/dashboard');
    } catch (err) {
      const errorCode = getApiErrorCode(err);
      if (errorCode === 'PASSWORD_SETUP_REQUIRED') {
        try {
          await apiClient.post('/expensify/auth/forgot-password', { email: data.email });
          await AsyncStorage.setItem('current-verify-email', data.email);
          showToast({
            text1: 'Please check your email to set a new password for your account',
            type: 'info',
            position: 'bottom',
            visibilityTime: 4000,
          });
          router.dismissTo('/(root)/(auth)/change-password');
        } catch (sendErr) {
          setServerError(getApiErrorMessage(sendErr));
        }
      } else if (errorCode === 'EMAIL_NOT_VERIFIED') {
        try {
          await apiClient.post('/expensify/auth/resend-otp', {
            email: data.email,
            purpose: 'signup_verify',
          });
          await AsyncStorage.setItem('current-verify-email', data.email);
          showToast({
            text1: 'Please verify your email to continue',
            type: 'info',
            position: 'bottom',
            visibilityTime: 4000,
          });
          router.dismissTo('/(root)/(auth)/mobile-verify');
        } catch (sendErr) {
          setServerError(getApiErrorMessage(sendErr));
        }
      } else {
        setServerError(getApiErrorMessage(err, 'Invalid email or password'));
      }
    } finally {
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
                <View style={[styles.iconBadge, { backgroundColor: `${colors.primary}1A` }]}>
                  <Image
                    source={require('@/assets/images/icon-themed.png')}
                    style={styles.iconBadgeImage}
                    resizeMode="contain"
                  />
                </View>
                <Text
                  style={[
                    styles.label,
                    {
                      color: colors.title,
                    },
                  ]}>
                  Welcome back to <Text style={{ color: colors.primary }}>Expensify</Text> 👋
                </Text>
                <Text style={[styles.subtext, { color: colors.description }]}>
                  Sign in to continue tracking your expenses
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
                      tint
                      height={42}
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
                      autoComplete="password"
                      textContentType="password"
                      onBlur={field.onBlur}
                      onChangeText={field.onChange}
                      error={errors.password?.message}
                      borderLess
                      tint
                      height={42}
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
                    disabled={isLoading}
                    onPress={handleSubmit(onSubmit)}>
                    {isLoading ? (
                      <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
                    ) : null}
                    <Text
                      style={[
                        styles.title,
                        { color: colors.onPrimary },
                        isLoading ? styles.textDisable : {},
                      ]}>
                      Sign In
                    </Text>
                  </TouchableOpacity>
                </View>
                <Spacer height={20} />
                <AuthLink
                  disabled={isLoading}
                  linkText="Forgot password"
                  onPress={() => {
                    router.replace('/forgot-password');
                  }}
                />
                <Spacer height={50} />
                <AuthLink
                  disabled={isLoading}
                  linkText="Sign Up"
                  description="Don't have an account? "
                  onPress={() => {
                    router.replace('/sign-up');
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginContainer: {
    justifyContent: 'center',
    paddingHorizontal: 35,
  },
  image: {
    height: 200,
    width: 200,
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
    borderRadius: 12,
    paddingVertical: 8,
    height: 44,
    width: '100%',
  },
  iconBadge: {
    width: 62,
    height: 62,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconBadgeImage: {
    width: 50,
    height: 50,
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
