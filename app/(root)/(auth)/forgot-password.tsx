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
import { useRouter } from 'expo-router';
import AuthLink from '@/components/AuthLink';
import Input from '@/components/Input';
import Spacer from '@/components/Spacer';
import { ThemedView } from '@/components/ThemedView';
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
      Alert.alert('Error', getApiErrorMessage(err, 'Could not send reset code'));
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
