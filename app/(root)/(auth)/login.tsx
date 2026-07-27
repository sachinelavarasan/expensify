import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

import Input from '@/components/Input';
import Spacer from '@/components/Spacer';
import SafeAreaViewComponent from '@/components/SafeAreaView';

import AuthLink from '@/components/AuthLink';
import { isClerkAPIResponseError, useClerk, useSignIn } from '@clerk/clerk-expo';
import { ThemedView } from '@/components/ThemedView';
import { useThemeContext } from '@/contexts/ThemedContext';

const emailValidation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameValidation = /^[a-z0-9]{8,20}$/;

const schema = z.object({
  username: z
    .string()
    .min(8, { message: 'Username or email required' })
    .refine((val) => emailValidation.test(val) || usernameValidation.test(val), {
      message:
        'Enter a valid email or username contains only lowercase letters and numbers (between 6 to 25 chars)',
    }),
  password: z.string(),
});

type SignInForm = z.infer<typeof schema>;

export default function SignIn() {
  const { colors } = useThemeContext();
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signOut } = useClerk();
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    resolver: zodResolver(schema),
  });

  // useEffect(() => {
  //   return () => {
  //     setError(null);
  //   };
  // }, [isFocused]);

  const onSubmit = async (data: SignInForm) => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      await signOut();
      const signInAttempt = await signIn.create({
        identifier: data.username,
        password: data.password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.dismissTo('/(root)/dashboard');
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
      setIsLoading(false);
      reset();
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        const errorCode = err.errors[0].code;
        console.log(errorCode);
        switch (errorCode) {
          case 'form_identifier_not_found':
            Alert.alert('Error', 'User not found. Please check your username or email address ');
            break;
          case 'form_password_incorrect':
            Alert.alert('Error', 'Incorrect password. Please try again.');
            break;
          case 'form_verification_invalid':
            Alert.alert('Error', 'Verification token is invalid or expired.');
            break;
          case 'form_identity_not_found':
            Alert.alert('Error', 'No user found with your detail.');
            break;
          case 'form_param_format_invalid':
            Alert.alert('Error', 'Please enter a valid email address');
            break;
          case 'form_identifier_exists':
            Alert.alert('Error', 'Given email number already exists');
            break;
          case 'form_internal_error':
            Alert.alert('Error', 'Internal error occurred. Please try again later.');
            break;
          default:
            Alert.alert('Error', JSON.stringify(err, null, 2));
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
                  Welcome Back! 👋{' '}
                </Text>
              </View>
              <Spacer height={25} />
              <View style={styles.loginContainer}>
                <Controller
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter email or username"
                      label="Email address or username"
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
                    disabled={isLoading}
                    onPress={handleSubmit(onSubmit)}>
                    {isLoading ? (
                      <ActivityIndicator animating color={'#FFF'} style={styles.loader} />
                    ) : null}
                    <Text style={[styles.title, isLoading ? styles.textDisable : {}]}>Sign In</Text>
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
