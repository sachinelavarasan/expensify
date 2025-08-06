import { StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const CustomSnackBar = ({ label, isVisible }: { label: string; isVisible: boolean }) => {
  const [visible, setVisible] = useState(isVisible);
  useEffect(() => {
    setVisible(isVisible);
  }, [isVisible]);
  return (
    <Snackbar
      style={{
        backgroundColor: '#282343',
        zIndex: 5,
        width: '100%',
      }}
      theme={{
        colors: { inverseOnSurface: '#fff', accent: '#fff' },
      }}
      visible={visible}
      onDismiss={() => setVisible(false)}
      action={{
        icon: ({ size }) => <Ionicons name="close" size={size} color="#D5D5D5" />,
        label: '',
        onPress: () => {
          setVisible(false);
        },
        style: { marginRight: 0 },
        labelStyle: { color: '#D5D5D5', marginRight: 0 },
      }}>
      {label}
    </Snackbar>
  );
};

export default CustomSnackBar;
