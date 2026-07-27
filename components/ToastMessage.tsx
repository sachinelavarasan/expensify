// components/ToastMessage.tsx

import React from 'react';
import Toast, { ToastConfig, BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';
import { StyleSheet } from 'react-native';
import { ToastPalette } from '@/utils/Colors';

// Define custom styles for different toast types
const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={styles.errorToast}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  info: (props) => (
    <InfoToast
      {...props}
      style={styles.infoToast}
      text1Style={styles.infoText1}
      text2Style={styles.text2}
    />
  ),
  // Customize more types if needed
};

const ToastMessage = () => {
  return <Toast config={toastConfig} />;
};

export const showToast = ({
  type,
  text1,
  text2,
  visibilityTime = 2000,
  position = 'top',
  topOffset = 80,
  bottomOffset = 80,
}: {
  type: 'success' | 'error' | 'info';
  text1: string;
  text2?: string;
  visibilityTime?: number;
  position?: 'top' | 'bottom';
  autoHide?: boolean;
  topOffset?: number;
  bottomOffset?: number;
}) => {
  Toast.show({
    type,
    text1,
    text2,
    visibilityTime,
    position,
    autoHide: true,
    topOffset,
    bottomOffset,
  });
};

export default ToastMessage;

// Custom styles for the toast messages
const styles = StyleSheet.create({
  successToast: {
    height: 55,
    backgroundColor: ToastPalette.successBg,
    borderLeftWidth: 0,
    paddingVertical: 15,
  },
  errorToast: {
    height: 55,
    backgroundColor: ToastPalette.errorBg,
    borderLeftWidth: 0,
    paddingVertical: 15,
  },
  infoToast: {
    height: 55,
    backgroundColor: ToastPalette.infoBg,
    borderLeftWidth: 0,
    paddingVertical: 15,
  },
  infoText1: {
    padding: 0,
    fontSize: 14,
    fontFamily: 'Inter-400',
    color: ToastPalette.infoText1,
  },
  text1: {
    padding: 0,
    fontSize: 14,
    fontFamily: 'Inter-400',
    color: ToastPalette.text1,
  },
  text2: {
    fontSize: 12,
    fontFamily: 'Inter-400',
    color: ToastPalette.text2,
  },
});
