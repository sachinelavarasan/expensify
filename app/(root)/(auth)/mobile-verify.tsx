import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useEffect, useState } from 'react';
import OTPTextInput from 'react-native-otp-textinput';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SafeAreaViewComponent from '@/components/SafeAreaView';
import Spacer from '@/components/Spacer';

import { otpValidation } from '@/utils/Validation-custom';
import { deviceWidth } from '@/utils/functions';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import AuthLink from '@/components/AuthLink';
import { ThemedView } from '@/components/ThemedView';
import { useThemeContext } from '@/contexts/ThemedContext';
import { showToast } from '@/components/ToastMessage';

const MobileVerify = () => {
  const [otp, setOtp] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const { signUp, isLoaded: isLoadedSignUp } = useSignUp();
  const { setActive, isLoaded } = useSignIn();
  const { colors } = useThemeContext();

  const router = useRouter();

  const [otpVerifyLoading, setIsOtpVerifyLoading] = useState(false);

  const handleTextChange = (data: string) => {
    setOtp(data);
  };

  useEffect(() => {
    (async () => {
      const storedEnabled = await AsyncStorage.getItem('current-verify-email');
      if (storedEnabled !== null) setEmail(storedEnabled);
    })();
  }, []);

  const verify = async () => {
    if (!isLoadedSignUp || !isLoaded) return;
    setIsOtpVerifyLoading(true);
    try {
      const res = await signUp.attemptEmailAddressVerification({
        code: otp,
      });

      if (res.verifications.emailAddress.status === 'verified') {
        await setActive({ session: res.createdSessionId });

        setTimeout(() => {
          showToast({
            text1: 'Your account created successfully',
            type: 'info',
            position: 'bottom',
          });
          router.dismissTo('/(root)/dashboard');
        }, 1000);
        await AsyncStorage.removeItem('current-verify-email');
      } else {
        Alert.alert('Error', 'Verification failed. Please check your code and try again.');
        console.log('error: verification status not verified');
      }
    } catch (err: any) {
      console.error('Verification error:', err);

      const errorCode = err?.errors?.[0]?.code || 'unknown_error';

      switch (errorCode) {
        case 'form_verification_invalid':
          Alert.alert('Error', 'Verification token is invalid or expired.');
          break;
        case 'form_rate_limited':
          Alert.alert('Error', 'Too many attempts. Please try again later.');
          break;
        case 'form_internal_error':
          Alert.alert('Error', 'Internal error occurred. Please try again later.');
          break;
        case 'form_identifier_exists':
          Alert.alert('Error', 'Given email already exists');
          break;
        default:
          Alert.alert('Error', JSON.stringify(err, null ,2));
          break;
      }
    } finally {
      setIsOtpVerifyLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
      style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <ThemedView style={{ flex: 1 }}>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              paddingHorizontal: 20,
            }}
            keyboardShouldPersistTaps={'always'}>
            <Spacer height={100} />
            <Text style={[styles.header, { color: colors.title }]}>Verify Email</Text>
            <Text style={[styles.subtext, { color: colors.description }]}>
              Enter the 6-digit code that has been sent to{' '}
              <Text style={[styles.subtext]}>{email}</Text>
            </Text>
            <Spacer height={30} />
            <OTPTextInput
              inputCount={6}
              containerStyle={styles.textInputContainer}
              textInputStyle={styles.roundedTextInput}
              inputCellLength={1}
              tintColor="#6900FF"
              offTintColor="#8880A0"
              keyboardType="numeric"
              autoFocus={true}
              handleTextChange={handleTextChange}></OTPTextInput>
            
            <Spacer height={40} />

            <TouchableOpacity
              style={[styles.button, otpVerifyLoading || !otpValidation(otp) ? styles.disable : {}]}
              onPress={verify}
              disabled={otpVerifyLoading || !otpValidation(otp)}>
              {otpVerifyLoading ? (
                <ActivityIndicator animating color={'#FFF'} style={styles.loader} />
              ) : null}
              <Text style={[styles.title, otpVerifyLoading ? styles.textDisable : {}]}>Verify</Text>
            </TouchableOpacity>

            <Spacer height={50} />
            <AuthLink
              disabled={otpVerifyLoading}
              linkText="SignUp"
              description="Go Back "
              onPress={() => {
                router.replace('/sign-up');
              }}
            />
          </ScrollView>
        </ThemedView>
      </SafeAreaViewComponent>
    </KeyboardAvoidingView>
  );
};

export default MobileVerify;

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-800',
  },
  subtext: {
    fontSize: 14,
    color: '#b7b6c1',
    fontFamily: 'Inter-400',
    paddingTop: 10,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: deviceWidth() - 80,
  },
  textInputContainer: {
    marginBottom: 20,
  },
  roundedTextInput: {
    borderRadius: 10,
    borderWidth: 4,
    color: '#8880A0',
    padding: 0,
    fontSize: 18,
    fontFamily: 'Inter-600',
    width: (deviceWidth() - 100) / 6,
    height: (deviceWidth() - 100) / 6,
    verticalAlign: 'middle',
    lineHeight: 18,
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
    opacity: 0.6,
  },
  textDisable: { opacity: 0 },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    width: deviceWidth() - 60,
    paddingBottom: 10,
  },
  error: {
    fontSize: 16,
    color: 'red',
    fontFamily: 'Inter-400',
  },
});
