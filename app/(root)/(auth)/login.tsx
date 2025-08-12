import React, { useEffect, useState } from 'react';
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

// import { enableNotificationToken, logIn, setError } from '@/redux/slices/auth/authSlice';
// import { useAppDispatch, useAppSelector } from '@/redux/hooks';

import { phoneValidation } from '@/utils/Validation-custom';
import AuthLink from '@/components/AuthLink';
import { isClerkAPIResponseError, useClerk, useSession, useSignIn } from '@clerk/clerk-expo';

const schema = z.object({
  phone: z
    .string()
    .min(1, { message: 'Must have at least 1 character' })
    .regex(phoneValidation, { message: 'invalid phone' }),
  password: z.string().min(8, { message: 'Minimum 8 characters' }),
});

type SignInForm = z.infer<typeof schema>;

export default function SignIn() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
   const {signOut} = useClerk();
  const { isSignedIn } = useSession()
  // const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    defaultValues: {
      phone: '',
      password: '',
    },
    resolver: zodResolver(schema),
  });

  // useEffect(() => {
  //   return () => {
  //     setError(null);
  //   };
  // }, [isFocused]);
  console.log(isSignedIn);

  const onSubmit = async (data: SignInForm) => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      await signOut();
      const signInAttempt = await signIn.create({
        identifier: data.phone,
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
            Alert.alert('Error', 'User not found. Please check your phone number.');
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
            Alert.alert('Error', 'Please enter a valid phone number including the correct country code.');
            break;
          case 'form_identifier_exists':
            Alert.alert('Error', 'Given phone number already exists');
            break;
          case 'form_internal_error':
            Alert.alert('Error', 'Internal error occurred. Please try again later.');
            break;
          default:
            Alert.alert('Error', 'An error occurred while signing in.');
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
                <Text style={styles.label}>Welcome Back! 👋 </Text>
              </View>
              <Spacer height={25} />
              <View style={styles.loginContainer}>
                <Controller
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="+91XXXXXXXXXX"
                      label="Phone Number"
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
                      placeholder="Enter password"
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
                    disabled={!isValid || isLoading}
                    onPress={handleSubmit(onSubmit)}>
                    {isLoading ? (
                      <ActivityIndicator animating color={'#FFF'} style={styles.loader} />
                    ) : null}
                    <Text style={[styles.title, isLoading ? styles.textDisable : {}]}>Sign In</Text>
                  </TouchableOpacity>
                </View>
                <Spacer height={50} />
                <AuthLink
                  linkText="Sign Up"
                  description="Don't have an account? "
                  onPress={() => {
                    router.replace('/sign-up');
                  }}
                />
                <Spacer height={50} />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaViewComponent>
    </KeyboardAvoidingView>
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
