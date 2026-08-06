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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AuthLink from '@/components/AuthLink';
import Input from '@/components/Input';
import Spacer from '@/components/Spacer';
import { ThemedView } from '@/components/ThemedView';
import FormErrorBanner from '@/components/FormErrorBanner';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import { useThemeContext } from '@/contexts/ThemedContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '@/components/ToastMessage';
import { apiClient, getApiErrorMessage } from '@/lib/apiClient';

const schema = z.object({
  email: z.email({ message: 'Invalid email address' }),
});

type ForgotPasswordForm = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
    setIsLoading(true);
    setServerError(null);
    try {
      await apiClient.post('/expensify/auth/forgot-password', { email: data.email });
      setIsLoading(false);
      showToast({
        text1: 'Your reset password request sent successfully',
        type: 'info',
        position: 'bottom',
        visibilityTime: 3000,
      });
      await AsyncStorage.setItem('current-verify-email', data.email);
      router.dismissTo('/(root)/(auth)/change-password');
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Could not send reset code'));
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
                  <Ionicons name="lock-closed-outline" size={26} color={colors.primary} />
                </View>
                <Text
                  style={[
                    styles.label,
                    {
                      color: colors.title,
                    },
                  ]}>
                  Forgot your <Text style={{ color: colors.primary }}>password</Text>?
                </Text>
                <Text style={[styles.subtext, { color: colors.description }]}>
                  Enter your email and we&apos;ll send you a reset code
                </Text>
              </View>
              <Spacer height={35} />
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
                      autoComplete="off"
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

                <Spacer height={40} />
                <View style={styles.btnContainer}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      { backgroundColor: colors.primary },
                      !isValid || isLoading ? styles.disable : {},
                    ]}
                    onPress={handleSubmit(onResetPasswordPress)}
                    disabled={!isValid || isLoading}>
                    {isLoading ? (
                      <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
                    ) : null}
                    <Text
                      style={[
                        styles.title,
                        { color: colors.onPrimary },
                        isLoading ? styles.textDisable : {},
                      ]}>
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
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
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
