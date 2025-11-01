import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@clerk/clerk-expo';
import { FontAwesome6 } from '@expo/vector-icons';
import { showToast } from './ToastMessage';

const AVATAR_SIZE = 70;

export default function ProfileImageUploader({ isSmall = false }: { isSmall?: boolean }) {
  const { user, isLoaded } = useUser();
  const [uploading, setUploading] = useState(false);

  if (!isLoaded) return null;

  const pickImage = async () => {
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

    const image = `data:${mimeType};base64,${base64}`;

    try {
      setUploading(true);

      await user?.setProfileImage({ file: image });

      await user?.reload();
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
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableOpacity onPress={pickImage} disabled={uploading}>
      {!!user?.imageUrl &&<Image
        source={{ uri: user?.imageUrl }}
        style={isSmall ? [styles.avatar] : styles.avatarFull}
        resizeMode={isSmall ? 'contain' : 'cover'}
      />}
      {!isSmall && (
        <View
          style={{
            position: 'absolute',
            bottom: 2,
            right: 10,
            backgroundColor: '#00000090',
            padding: 6,
            borderRadius: 20,
          }}>
          <FontAwesome6 name="edit" size={12} color="#ccc" />
        </View>
      )}
    </TouchableOpacity>
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
    borderColor: '#6900FF',
  },
});
