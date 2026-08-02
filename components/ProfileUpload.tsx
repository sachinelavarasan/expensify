import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Image,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { QueryObserverResult } from '@tanstack/react-query';
import { showToast } from './ToastMessage';
import ModalCard from './ModalCard';
import UpdateProfile, { UpdateProfileHandle } from './UpdateProfile';
import { useThemeContext } from '@/contexts/ThemedContext';
import { useGetUserData, useRemoveProfileImage, useUploadProfileImage } from '@/hooks/useUserStore';
import { IExpUser } from '@/types';

const AVATAR_SIZE = 70;
const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

type Props = {
  isSmall?: boolean;
  refetch: () => Promise<QueryObserverResult<IExpUser, Error>>;
};

export default function ProfileImageUploader({ isSmall = false, refetch }: Props) {
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();
  const { user, loading } = useGetUserData();
  const { mutateAsync: uploadImage, isPending: uploading } = useUploadProfileImage();
  const { mutateAsync: removeImage, isPending: removing } = useRemoveProfileImage();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const updateProfileRef = useRef<UpdateProfileHandle>(null);
  const [showPreview, setShowPreview] = useState(false);

  const openOptions = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const closeOptions = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const viewCurrentImage = () => {
    closeOptions();
    setShowPreview(true);
  };

  const editProfile = () => {
    closeOptions();
    updateProfileRef.current?.open();
  };

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
        text1: 'Image is too large. Maximum size is 1MB.',
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
          <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
            <FontAwesome6 name="pen" size={11} color={colors.onPrimary} />
          </View>
        )}
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.cardBg }}
        handleIndicatorStyle={{ backgroundColor: colors.borderColor }}>
        <BottomSheetView style={[styles.sheetContent, { paddingBottom: 30 + insets.bottom }]}>
          <Text style={[styles.sheetTitle, { color: colors.title }]}>Profile</Text>

          <Pressable style={styles.optionRow} onPress={editProfile}>
            <View style={[styles.optionIconBadge, { backgroundColor: colors.primary + '1A' }]}>
              <FontAwesome6 name="user-pen" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.optionText, { color: colors.title }]}>Edit Profile</Text>
          </Pressable>

          {!!user?.exp_us_profile_url && (
            <Pressable style={styles.optionRow} onPress={viewCurrentImage}>
              <View style={[styles.optionIconBadge, { backgroundColor: colors.primary + '1A' }]}>
                <FontAwesome6 name="expand" size={16} color={colors.primary} />
              </View>
              <Text style={[styles.optionText, { color: colors.title }]}>View Photo</Text>
            </Pressable>
          )}

          <Pressable style={styles.optionRow} onPress={pickImage}>
            <View style={[styles.optionIconBadge, { backgroundColor: colors.primary + '1A' }]}>
              <FontAwesome6 name="camera" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.optionText, { color: colors.title }]}>
              {user?.exp_us_profile_url ? 'Change Photo' : 'Add Photo'}
            </Text>
          </Pressable>

          {!!user?.exp_us_profile_url && (
            <Pressable style={styles.optionRow} onPress={removeCurrentImage}>
              <View style={[styles.optionIconBadge, { backgroundColor: colors.danger + '1A' }]}>
                <FontAwesome6 name="trash" size={16} color={colors.danger} />
              </View>
              <Text style={[styles.optionText, { color: colors.danger }]}>Remove Photo</Text>
            </Pressable>
          )}
        </BottomSheetView>
      </BottomSheetModal>

      <UpdateProfile ref={updateProfileRef} refetch={refetch} />

      <ModalCard
        visible={showPreview}
        onClose={() => setShowPreview(false)}
        title="Profile Picture">
        {!!user?.exp_us_profile_url && (
          <Image
            source={{ uri: user.exp_us_profile_url }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        )}
      </ModalCard>

      <ModalCard visible={uploading} closeDisabled title="Uploading Photo">
        <View style={styles.uploadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.progressLabel, { color: colors.description }]}>Uploading…</Text>
        </View>
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

  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  progressLabel: {
    fontSize: 13,
    fontFamily: 'Inter-500',
    textAlign: 'center',
  },

  previewImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
});
