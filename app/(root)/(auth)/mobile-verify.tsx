import {
  ActivityIndicator,
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
import FormErrorBanner from '@/components/FormErrorBanner';

import { otpValidation } from '@/utils/Validation-custom';
import { deviceWidth } from '@/utils/functions';
import { apiClient, getApiErrorMessage } from '@/lib/apiClient';
import { useAuthContext } from '@/contexts/AuthContext';
import AuthLink from '@/components/AuthLink';
import { ThemedView } from '@/components/ThemedView';
import { useThemeContext } from '@/contexts/ThemedContext';
import { showToast } from '@/components/ToastMessage';

const MobileVerify = () => {
  const [otp, setOtp] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const { signIn } = useAuthContext();
  const { colors } = useThemeContext();
  const otpTextInputStyle = { ...styles.roundedTextInput, color: colors.arrowColor };

  const router = useRouter();

  const [otpVerifyLoading, setIsOtpVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
    setIsOtpVerifyLoading(true);
    setServerError(null);
    try {
      const response = await apiClient.post('/expensify/auth/verify-signup-otp', {
        email,
        code: otp,
      });
      await signIn(response.data);
      await AsyncStorage.removeItem('current-verify-email');
      showToast({
        text1: 'Your account created successfully',
        type: 'info',
        position: 'bottom',
      });
      router.dismissTo('/(root)/dashboard');
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Verification failed. Please try again.'));
    } finally {
      setIsOtpVerifyLoading(false);
    }
  };

  const resendCode = async () => {
    setResendLoading(true);
    setServerError(null);
    try {
      await apiClient.post('/expensify/auth/resend-otp', { email, purpose: 'signup_verify' });
      showToast({
        text1: 'A new code has been sent to your email',
        type: 'info',
        position: 'bottom',
      });
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Could not resend code'));
    } finally {
      setResendLoading(false);
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
            <Text style={[styles.header, { color: colors.title }]}>
              Verify your <Text style={{ color: colors.primary }}>Expensify</Text> email
            </Text>
            <Text style={[styles.subtext, { color: colors.description }]}>
              Enter the 6-digit code that has been sent to{' '}
              <Text style={[styles.subtext, { color: colors.description }]}>{email}</Text>
            </Text>
            <Spacer height={20} />
            <FormErrorBanner message={serverError} />
            <Spacer height={serverError ? 16 : 30} />
            <OTPTextInput
              inputCount={6}
              containerStyle={styles.textInputContainer}
              textInputStyle={otpTextInputStyle}
              inputCellLength={1}
              tintColor={colors.primary}
              offTintColor={colors.arrowColor}
              keyboardType="numeric"
              autoFocus={true}
              handleTextChange={handleTextChange}></OTPTextInput>

            <Spacer height={40} />

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primary },
                otpVerifyLoading || !otpValidation(otp) ? styles.disable : {},
              ]}
              onPress={verify}
              disabled={otpVerifyLoading || !otpValidation(otp)}>
              {otpVerifyLoading ? (
                <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
              ) : null}
              <Text
                style={[
                  styles.title,
                  { color: colors.onPrimary },
                  otpVerifyLoading ? styles.textDisable : {},
                ]}>
                Verify
              </Text>
            </TouchableOpacity>

            <Spacer height={30} />
            <AuthLink
              disabled={resendLoading}
              linkText="Resend code"
              description="Didn't receive a code? "
              onPress={resendCode}
            />

            <Spacer height={30} />
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
    fontFamily: 'Inter-800',
  },
  subtext: {
    fontSize: 14,
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
