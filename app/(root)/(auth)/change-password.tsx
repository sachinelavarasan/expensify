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
import { useEffect, useState } from 'react';
import OTPTextInput from 'react-native-otp-textinput';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SafeAreaViewComponent from '@/components/SafeAreaView';
import Spacer from '@/components/Spacer';

import { otpValidation, passwordValidation } from '@/utils/Validation-custom';
import { deviceHeight, deviceWidth } from '@/utils/functions';
import { useSignIn } from '@clerk/clerk-expo';
import AuthLink from '@/components/AuthLink';
import { ThemedView } from '@/components/ThemedView';
import { useThemeContext } from '@/contexts/ThemedContext';
import Input from '@/components/Input';
import { showToast } from '@/components/ToastMessage';

const ChangePassword = () => {
  const [otp, setOtp] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const { signIn, isLoaded, setActive } = useSignIn();
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
    if (!isLoaded || !newPassword) return;
    setIsOtpVerifyLoading(true);
    try {
      const res = await signIn.attemptFirstFactor({
        code: otp,
        strategy: 'reset_password_email_code',
        password: newPassword,
      });

      if (res.status === 'complete') {
        await setActive({ session: res.createdSessionId });
        await AsyncStorage.removeItem('current-verify-email');
        router.dismissTo('/(root)/dashboard');
        showToast({
          text1: 'Your account password updated successfully',
          type: 'info',
          position: 'bottom',
          visibilityTime: 3000,
        });
      } else {
        Alert.alert('Error', 'Verification failed. Please check your code and try again.');
        console.log('error: verification status not verified');
        router.navigate('/(root)/(auth)/forgot-password');
      }
    } catch (err: any) {
      console.error('Verification error:', JSON.stringify(err, null, 2));

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
        case 'needs_new_password':
          Alert.alert('Error', 'Enter valid password');
          break;
        case 'form_code_incorrect':
          Alert.alert('Error', 'Invalid otp code');
          break;
        default:
          Alert.alert('Error', JSON.stringify(err, null, 2));
          break;
      }
      // await AsyncStorage.removeItem('current-verify-number');
      // router.navigate('/(root)/(auth)/forgot-password');
    } finally {
      setIsOtpVerifyLoading(false);
    }
  };

  return (
    <SafeAreaViewComponent>
      <ThemedView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
          style={{ flex: 1 }}>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flex: 1,
              display: 'flex',
              paddingHorizontal: 20,
            }}
            keyboardShouldPersistTaps={'always'}>
            <Spacer height={100} />
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.header, { color: colors.title }]}>Change Password</Text>
              <Text style={[styles.subtext, { color: colors.description }]}>
                Enter the 6-digit code that has been sent to{' '}
                <Text style={[styles.subtext]}>{email}</Text>
              </Text>
            </View>
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

            <Spacer height={20} />

            <Input
              placeholder="New Password"
              label="New Password"
              autoCapitalize="none"
              isPassword
              onChangeText={setNewPassword}
              borderLess
              value={newPassword}
              isRequired
            />

            <Spacer height={40} />
            <TouchableOpacity
              style={[
                styles.button,
                otpVerifyLoading || !otpValidation(otp) || !passwordValidation(newPassword)
                  ? styles.disable
                  : {},
              ]}
              onPress={verify}
              disabled={
                otpVerifyLoading || !otpValidation(otp) || !passwordValidation(newPassword)
              }>
              {otpVerifyLoading ? (
                <ActivityIndicator animating color={'#FFF'} style={styles.loader} />
              ) : null}
              <Text style={[styles.title, otpVerifyLoading ? styles.textDisable : {}]}>Verify</Text>
            </TouchableOpacity>

            <Spacer height={50} />
            <AuthLink
              disabled={otpVerifyLoading}
              linkText="Go Back"
              onPress={() => {
                router.replace('/(root)/(auth)/forgot-password');
              }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaViewComponent>
  );
};

export default ChangePassword;

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
