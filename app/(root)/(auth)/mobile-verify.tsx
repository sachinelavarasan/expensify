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
import Modal from 'react-native-modal';
import { useEffect, useState } from 'react';
import OTPTextInput from 'react-native-otp-textinput';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SafeAreaViewComponent from '@/components/SafeAreaView';
import Spacer from '@/components/Spacer';

import { otpValidation } from '@/utils/Validation-custom';
import { deviceHeight, deviceWidth } from '@/utils/functions';
import { useClerk, useSignUp } from '@clerk/clerk-expo';
import AuthLink from '@/components/AuthLink';

const MobileVerify = () => {
  const [otp, setOtp] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const { signUp, isLoaded: isLoadedSignUp } = useSignUp();
  const {signOut} = useClerk();
  const [isModalVisible, setModalVisible] = useState(false);

  const router = useRouter();

  const [otpVerifyLoading, setIsOtpVerifyLoading] = useState(false);
  const width = deviceWidth();
  const height = deviceHeight();

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleTextChange = (data: string) => {
    setOtp(data);
  };

  useEffect(() => {
    (async () => {
      const storedEnabled = await AsyncStorage.getItem('current-verify-number');
      if (storedEnabled !== null) setPhone(storedEnabled);
    })();
  }, []);

  const verify = async () => {
    if (!isLoadedSignUp) return;
    setIsOtpVerifyLoading(true);
    try {
      const res = await signUp.attemptPhoneNumberVerification({
        code: otp,
      });


      if (res.verifications.phoneNumber.status === 'verified') {
         await signOut(); 
        router.dismissTo('/(root)/(auth)/login');
        await AsyncStorage.removeItem('current-verify-number');
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
          Alert.alert('Error', 'Given phone number already exists');
          break;
        default:
          Alert.alert('Error', 'This verification has expired. Go Back and Try again!');
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
          <Text style={styles.header}>Verify Phone</Text>
          <Text style={styles.subtext}>
            Enter the 6-digit code that has been sent to{' '}
            <Text style={[styles.subtext]}>{phone}</Text>
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
          {/* {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.error}>{error}</Text>
            </View>
          )} */}
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
            linkText="SignUp"
            description="Go Back "
            onPress={() => {
              router.replace('/sign-up');
            }}
          />
          <Modal
            isVisible={isModalVisible}
            hasBackdrop={true}
            deviceHeight={height}
            deviceWidth={width}
            coverScreen={true}>
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  backgroundColor: '#0E0E10',
                  width: width - 60,
                  borderRadius: 10,
                  paddingVertical: 30,
                  paddingHorizontal: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 18,
                    textAlign: 'center',
                    lineHeight: 24,
                    fontFamily: 'Inter-500',
                  }}>
                  Your mobile number has been verified successfully.
                </Text>
                <Spacer height={30} />
                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      width: 'auto',
                      paddingVertical: 10,
                      paddingHorizontal: 30,
                      backgroundColor: '#463e75',
                    },
                  ]}
                  onPress={() => {
                    toggleModal();
                    setTimeout(() => {
                      router.replace('/(root)/(auth)/login');
                    }, 500);
                  }}>
                  <Text style={[styles.title]}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
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
