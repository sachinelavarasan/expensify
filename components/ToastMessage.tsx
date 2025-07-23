// components/ToastMessage.tsx

import React from 'react';
import Toast, { ToastConfig, BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';
import { StyleSheet } from 'react-native';

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
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  // Customize more types if needed
};

const ToastMessage: React.FC = () => {
  return <Toast config={toastConfig} />;
};

export const showToast = ({
  type,
  text1,
  text2,
  visibilityTime = 2000,
  position = 'top',
  topOffset,
  bottomOffset,
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
    height: 40,
    borderLeftColor: 'green',
    borderLeftWidth: 5,
    backgroundColor: '#B8D6B8',
  },
  errorToast: {
    height: 40,
    borderLeftColor: '#A90303',
    borderLeftWidth: 5,
    backgroundColor: '#EEBDBD',
  },
  infoToast: {
    height: 40,
    borderLeftColor: '#CFCFCF',
    borderLeftWidth: 5,
    backgroundColor: '#E7E7E7',
  },
  text1: {
    padding: 0,
    fontSize: 15,
    fontFamily: 'Inter-400',
    fontWeight: 'bold',
    color: '#000',
  },
  text2: {
    fontSize: 14,
    fontFamily: 'Inter-500',
    color: '#333',
  },
});
