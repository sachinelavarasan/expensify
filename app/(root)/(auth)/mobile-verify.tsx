import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import OTPTextInput from 'react-native-otp-textinput';
import { Ionicons } from '@expo/vector-icons';
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
  const otpTextInputStyle = {
    ...styles.roundedTextInput,
    color: colors.primary,
    backgroundColor: colors.cardBg,
    shadowColor: colors.primary,
  };

  const router = useRouter();

  const [otpVerifyLoading, setIsOtpVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(30);

  useEffect(() => {
    if (resendCooldown === 0) return;
    const timer = setInterval(() => {
      setResendCooldown((seconds) => (seconds <= 1 ? 0 : seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown === 0]);

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
      setResendCooldown(30);
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
              Enter the 6-digit code we sent to
            </Text>
            <Spacer height={10} />
            <View
              style={[
                styles.emailChip,
                { backgroundColor: colors.barBackground, borderColor: colors.borderColor },
              ]}>
              <Ionicons name="mail-outline" size={14} color={colors.lighterTitle} />
              <Text
                style={[styles.emailChipText, { color: colors.title }]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {email}
              </Text>
            </View>
            <Spacer height={20} />
            <FormErrorBanner message={serverError} />
            <Spacer height={serverError ? 16 : 30} />
            <OTPTextInput
              inputCount={6}
              containerStyle={styles.textInputContainer}
              textInputStyle={otpTextInputStyle}
              inputCellLength={1}
              tintColor={colors.borderSelected}
              offTintColor={colors.inputBorder}
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
              disabled={resendLoading || resendCooldown > 0}
              linkText={
                resendCooldown > 0
                  ? `Resend in 0:${String(resendCooldown).padStart(2, '0')}`
                  : 'Resend code'
              }
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
  emailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: deviceWidth() - 80,
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  emailChipText: {
    fontSize: 13,
    fontFamily: 'Inter-600',
    flexShrink: 1,
  },
  textInputContainer: {
    marginBottom: 20,
  },
  roundedTextInput: {
    borderRadius: 14,
    borderWidth: 1,
    borderBottomWidth: 1,
    padding: 0,
    fontSize: 22,
    fontFamily: 'Inter-600',
    width: (deviceWidth() - 100) / 6,
    height: (deviceWidth() - 100) / 6,
    verticalAlign: 'middle',
    lineHeight: 22,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 12,
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
});
