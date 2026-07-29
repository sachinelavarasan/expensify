import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useReminderSettings } from '@/hooks/useReminder';
import { useAuthContext } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { THEME_STORAGE_KEY, useThemeContext } from '@/contexts/ThemedContext';

const LogoutButton = () => {
  const { colors } = useThemeContext();
  const { disableNotification } = useReminderSettings();
  const { signOut } = useAuthContext();
  const router = useRouter();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [loading, setLoading] = useState(false);

  const openModal = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const closeModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="none"
        disappearsOnIndex={-1}
        appearsOnIndex={1}
        style={{ backgroundColor: colors.scrim }}
      />
    ),
    [colors],
  );

  const handleProceed = async () => {
    setLoading(true);
    try {
      await signOut();
      await disableNotification();
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.removeMany(keys.filter((key) => key !== THEME_STORAGE_KEY));
      router.replace('/(root)/(auth)/login');
    } catch (e) {
      console.log('Logout failed:', e);
      setLoading(false);
    }
  };

  const handleCancel = useCallback(() => {
    if (loading) return;
    closeModal();
  }, [loading, closeModal]);

  const renderBottomSheetContent = useCallback(
    () => (
      <View style={styles.contentContainer}>
        <View style={[styles.iconBadge, { backgroundColor: colors.danger + '1A' }]}>
          <Ionicons name="log-out-outline" size={30} color={colors.danger} />
        </View>

        <Text style={[styles.title, { color: colors.title }]}>Log out?</Text>
        <Text style={[styles.description, { color: colors.description }]}>
          You&apos;ll need to sign in again to access your account.
        </Text>

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.button, { borderColor: colors.inputBorder, borderWidth: 1 }]}
            disabled={loading}
            onPress={handleCancel}>
            <Text style={[styles.buttonText, { color: colors.description }]}>Cancel</Text>
          </Pressable>

          <Pressable
            style={[styles.button, { backgroundColor: colors.danger }, loading && styles.disabled]}
            onPress={handleProceed}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator animating color={colors.onPrimary} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Log Out</Text>
            )}
          </Pressable>
        </View>
      </View>
    ),
    [colors, loading, handleCancel],
  );

  return (
    <View style={{ width: '100%' }}>
      <TouchableOpacity
        style={[styles.logoutRow, { backgroundColor: colors.danger }]}
        onPress={openModal}
        disabled={loading}>
        <Ionicons name="log-out-outline" size={20} color={colors.onPrimary} />
        <Text style={[styles.logoutText, { color: colors.onPrimary }]}>Logout</Text>
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={['32%']}
        enablePanDownToClose={!loading}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: colors.cardBg }}
        handleIndicatorStyle={{ backgroundColor: colors.borderColor }}>
        {renderBottomSheetContent()}
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-600',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-400',
    textAlign: 'center',
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-600',
  },
  disabled: {
    opacity: 0.7,
  },
  logoutRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    width: '100%',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-600',
  },
});

export default LogoutButton;
