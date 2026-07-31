import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';

import { useThemeContext } from '@/contexts/ThemedContext';

const NetworkInfoModal = () => {
  const [connected, setConnected] = useState<boolean | null>(null);
  const { colors } = useThemeContext();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (connected !== false) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.wrapper}>
      <View style={[styles.banner, { backgroundColor: colors.cardBg, shadowColor: colors.shadow }]}>
        <Ionicons name="cloud-offline-outline" size={16} color={colors.description} />
        <Text style={[styles.text, { color: colors.description }]}>
          You&apos;re offline — showing saved data
        </Text>
      </View>
    </View>
  );
};

export default NetworkInfoModal;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 50,
    zIndex: 999,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  text: {
    fontSize: 13,
    fontFamily: 'Inter-500',
  },
});
