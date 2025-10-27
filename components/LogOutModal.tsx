import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  cancelAnimation,
  withTiming,
  withRepeat,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useReminderSettings } from '@/hooks/useReminder';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/contexts/ThemedContext';

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

const AnimatedLogoutIcon = () => {
  const { colors } = useThemeContext();
  const { disableNotification } = useReminderSettings();
  const { signOut } = useAuth();
  const router = useRouter();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const translateX = useSharedValue(0);

  const animatedStyles1 = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const openModal = useCallback(() => {
     
    bottomSheetModalRef.current?.present();
    setIsSheetOpen((prev) => !prev);
  }, [isSheetOpen]);

  const closeModal = useCallback(() => {
     
    bottomSheetModalRef.current?.dismiss()
    setIsSheetOpen((prev) => !prev);
  }, [isSheetOpen]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="none"
        disappearsOnIndex={-1}
        appearsOnIndex={1}
        style={{ backgroundColor: '#00000088' }}
      />
    ),
    [],
  );

  const onSubmit = async () => {
    try {
      await signOut();
      await disableNotification();
      await AsyncStorage.clear();
      router.replace('/(root)/(auth)/login');
    } catch (e) {
      console.log('Logout failed:', e);
    } finally {
      setLoading(false);
      onDismiss();
    }
  };

  const handleProceed = async () => {
    setLoading(true);

    const bounceSequence = withSequence(
      withTiming(0, {
        duration: 0,
        easing: Easing.inOut(Easing.ease),
      }),
      withTiming(50, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }),
      withTiming(-50, {
        duration: 1600,
        easing: Easing.inOut(Easing.ease),
      }),
      withTiming(0, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }),
    );
    translateX.value = withRepeat(bounceSequence, -1, false);

    setTimeout(() => {
      onSubmit();
    }, 2500);
  };

  const onDismiss = () => {
    if(loading) return;
    closeModal();
    cancelAnimation(translateX);
    translateX.value = 0;
  };

  const renderBottomSheetContent = useCallback(
    () => (
      <View style={styles.contentContainer}>
        <Animated.View style={[animatedStyles1]}>
          <AnimatedIcon name="log-out-outline" size={60} color={'#aaa'} />
        </Animated.View>

        <Text style={[styles.description, { color: colors.text }]}>
          {loading ? 'Logging out...' : 'Are you sure you want to log out?'}
        </Text>
        <Text
          style={[
            {
              color: colors.description,
              fontSize: 14,
              textAlign: 'center',
              marginBottom: 15,
              marginTop: 4,
              fontFamily: 'Inter-400',
            },
          ]}>
          Thank you and see you again! ❤️
        </Text>

        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.buttons,
              {
                borderColor: colors.inputBorder,
                borderWidth: 1,
              },
            ]}
            disabled={loading}
            onPress={onDismiss}>
            <Text style={[styles.buttonText, { color: colors.description }]}>Cancel</Text>
          </Pressable>

          <Pressable
            style={[
              styles.buttons,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={handleProceed}
            disabled={loading}>
            <Text style={styles.buttonText}>Yes, logout</Text>
          </Pressable>
        </View>
      </View>
    ),
    [animatedStyles1, colors, loading],
  );

  return (
    <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#cc1928' }]}
        onPress={openModal}
        disabled={loading}>
        <Ionicons name="log-out-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={['40%']}
        enablePanDownToClose
        onDismiss={onDismiss}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: colors.cardBg }}
        handleIndicatorStyle={{ backgroundColor: '#ccc' }}>
        {renderBottomSheetContent()}
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 15,
    fontFamily: 'Inter-600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
  },
  buttons: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-600',
  },
  logoutText: {
    fontSize: 17,
    color: '#fff',
    fontFamily: 'Inter-600',
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    width: '100%',
  },
});

export default AnimatedLogoutIcon;
