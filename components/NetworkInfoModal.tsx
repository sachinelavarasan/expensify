import { Image, StyleSheet, Text } from 'react-native';
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import ModalCard from '@/components/ModalCard';

import Spacer from '@/components/Spacer';

import { useThemeContext } from '@/contexts/ThemedContext';

const NetworkInfoModal = () => {
  const [netInfo, setNetInfo] = useState<{ type: string; connected: any }>({
    type: '',
    connected: null,
  });
  const { colors } = useThemeContext();
  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetInfo({
        type: state.type,
        connected: state.isConnected,
      });
    });

    return () => {
      // Unsubscribe to network state updates
      unsubscribe();
    };
  }, []);

  if (netInfo.connected !== false) {
    return null;
  }
  return (
    <ModalCard visible contentStyle={styles.modal}>
      <Image source={require('@/assets/icons/network-warning.png')} />
      <Text style={[styles.title, { color: colors.title }]}>Network Error</Text>
      <Spacer height={15} />
      <Text style={[styles.subTitle, { color: colors.description }]}>
        There is an error occurred while connecting to network. Please check your mobile network.
      </Text>
    </ModalCard>
  );
};

export default NetworkInfoModal;

const styles = StyleSheet.create({
  modal: {
    paddingTop: 30,
    paddingBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 16,
    fontFamily: 'Inter-700',
  },
  subTitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter-500',
  },
});
