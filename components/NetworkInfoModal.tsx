import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import Modal from 'react-native-modal';

import Spacer from '@/components/Spacer';

import { deviceWidth, deviceHeight } from '@/utils/functions';
import { useThemeContext } from '@/contexts/ThemedContext';

const NetworkInfoModal = () => {
  const [netInfo, setNetInfo] = useState<{ type: string; connected: any }>({
    type: '',
    connected: null,
  });
  const { colors, theme } = useThemeContext();
  const width = deviceWidth();
  const height = deviceHeight();
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

  if ((netInfo.type === 'cellular' || 'wifi') && netInfo.connected) {
    return null;
  }
  return (
    <Modal
    backdropColor={theme === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
      isVisible={true}
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
        <View style={[styles.modal, {  backgroundColor: colors.background }]}>
          <Image source={require('@/assets/icons/network-warning.png')} />
          <Text style={[styles.title , { color:  colors.title}]}>Network Error</Text>
          <Spacer height={15} />
          <Text style={[styles.subTitle, { color:  colors.description}]}>
            There is an error occurred while connecting to network. Please check your mobile
            network.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default NetworkInfoModal;

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#1C1C29',
    width: deviceWidth() - 60,
    borderRadius: 10,
    paddingVertical: 30,
    paddingHorizontal: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 16,
    fontFamily: 'Inter-700',
  },
  subTitle: {
    color: '#C7C7C7',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter-500',
  },
});
