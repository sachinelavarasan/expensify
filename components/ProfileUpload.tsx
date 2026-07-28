import React, { useCallback, useRef } from 'react';
import { View, Image, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import { FontAwesome6 } from '@expo/vector-icons';
import { showToast } from './ToastMessage';
import ModalCard from './ModalCard';
import { useThemeContext } from '@/contexts/ThemedContext';
import { useGetUserData, useRemoveProfileImage, useUploadProfileImage } from '@/hooks/useUserStore';

const AVATAR_SIZE = 70;
const MAX_FILE_SIZE_BYTES = 500 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function ProfileImageUploader({ isSmall = false }: { isSmall?: boolean }) {
  const { colors } = useThemeContext();
  const { user, loading } = useGetUserData();
  const { mutateAsync: uploadImage, isPending: uploading, progress } = useUploadProfileImage();
  const { mutateAsync: removeImage, isPending: removing } = useRemoveProfileImage();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const openOptions = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const closeOptions = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        style={{ backgroundColor: colors.scrim }}
      />
    ),
    [colors],
  );

  if (loading) return null;

  const removeCurrentImage = async () => {
    closeOptions();
    try {
      await removeImage();
      showToast({
        text1: 'Profile picture removed',
        type: 'info',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (err) {
      console.error('Remove failed', err);
      showToast({
        text1: 'Failed to remove image',
        type: 'error',
        position: 'bottom',
        visibilityTime: 2000,
      });
    }
  };

  const pickImage = async () => {
    closeOptions();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (result.canceled) return;

    const base64 = result.assets[0].base64;
    const mimeType = result.assets[0].mimeType;

    if (!base64 || !mimeType) return;

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      showToast({
        text1: 'Unsupported file type. Use JPEG, PNG, or WEBP.',
        type: 'error',
        position: 'bottom',
        visibilityTime: 2500,
      });
      return;
    }

    const sizeInBytes = Math.ceil((base64.length * 3) / 4);
    if (sizeInBytes > MAX_FILE_SIZE_BYTES) {
      showToast({
        text1: 'Image is too large. Maximum size is 500KB.',
        type: 'error',
        position: 'bottom',
        visibilityTime: 2500,
      });
      return;
    }

    const image = `data:${mimeType};base64,${base64}`;

    try {
      await uploadImage(image);
      showToast({
        text1: 'Profile image updated!',
        type: 'info',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (err) {
      console.error('Upload failed', err);
      showToast({
        text1: 'Failed to upload image',
        type: 'error',
        position: 'bottom',
        visibilityTime: 2000,
      });
    }
  };

  const handlePress = () => {
    if (!user?.exp_us_profile_url) {
      pickImage();
      return;
    }
    openOptions();
  };

  return (
    <>
      <TouchableOpacity onPress={handlePress} disabled={uploading || removing}>
        {user?.exp_us_profile_url ? (
          <Image
            source={{ uri: user.exp_us_profile_url }}
            style={isSmall ? [styles.avatar] : [styles.avatarFull, { borderColor: colors.primary }]}
            resizeMode={isSmall ? 'contain' : 'cover'}
          />
        ) : (
          <View
            style={[
              isSmall ? styles.avatar : [styles.avatarFull, { borderColor: colors.primary }],
              styles.avatarPlaceholder,
              { backgroundColor: colors.primary },
            ]}>
            <FontAwesome6 name="user" size={isSmall ? 16 : 28} color={colors.onPrimary} />
          </View>
        )}
        {!isSmall && (
          <View style={[styles.editBadge, { backgroundColor: colors.scrim }]}>
            <FontAwesome6 name="camera" size={11} color={colors.onPrimary} />
          </View>
        )}
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={['28%']}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.cardBg }}
        handleIndicatorStyle={{ backgroundColor: colors.borderColor }}>
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: colors.title }]}>Profile Picture</Text>

          <Pressable style={styles.optionRow} onPress={pickImage}>
            <View style={[styles.optionIconBadge, { backgroundColor: colors.primary + '1A' }]}>
              <FontAwesome6 name="camera" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.optionText, { color: colors.title }]}>Change Photo</Text>
          </Pressable>

          <Pressable style={styles.optionRow} onPress={removeCurrentImage}>
            <View style={[styles.optionIconBadge, { backgroundColor: colors.danger + '1A' }]}>
              <FontAwesome6 name="trash" size={16} color={colors.danger} />
            </View>
            <Text style={[styles.optionText, { color: colors.danger }]}>Remove Photo</Text>
          </Pressable>
        </View>
      </BottomSheetModal>

      <ModalCard visible={uploading} closeDisabled title="Uploading Photo">
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: colors.primary },
            ]}
          />
        </View>
        <Text style={[styles.progressLabel, { color: colors.description }]}>{progress}%</Text>
      </ModalCard>
    </>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: '100%',
    height: '100%',
  },

  avatarFull: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    marginRight: 12,
    borderWidth: 2,
  },

  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 10,
    padding: 6,
    borderRadius: 20,
  },

  sheetContent: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 30,
  },

  sheetTitle: {
    fontSize: 16,
    fontFamily: 'Inter-600',
    marginBottom: 16,
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },

  optionIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionText: {
    fontSize: 15,
    fontFamily: 'Inter-500',
  },

  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(128,128,128,0.25)',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  progressLabel: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: 'Inter-500',
    textAlign: 'center',
  },
});
