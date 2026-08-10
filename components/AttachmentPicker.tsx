import React, { useCallback, useRef, useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6, MaterialIcons } from '@expo/vector-icons';

import ModalCard from './ModalCard';
import RowField from './RowField';
import { showToast } from './ToastMessage';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';

const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

// A picked file is kept entirely local (never uploaded) until the transaction save
// actually succeeds - see transaction.tsx's onSubmit, which is what turns a `local`
// value into a `remote` one by calling the upload endpoint at save time. This avoids
// orphaning files in Cloudinary when the user picks a file then backs out without saving.
export type AttachmentValue =
  | { kind: 'remote'; url: string }
  | { kind: 'local'; previewUri: string; base64: string; mimeType: string }
  | null;

interface Props {
  value: AttachmentValue;
  onChange: (value: AttachmentValue) => void;
  showDivider?: boolean;
}

export default function AttachmentPicker({ value, onChange, showDivider }: Props) {
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

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

  const isPdf =
    value?.kind === 'remote'
      ? /\.pdf$/i.test(value.url)
      : value?.kind === 'local'
        ? value.mimeType === 'application/pdf'
        : false;

  const displayUri = value?.kind === 'remote' ? value.url : value?.kind === 'local' ? value.previewUri : null;

  const stageFile = (base64: string, mimeType: string, previewUri: string) => {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      showToast({
        text1: 'Unsupported file type. Use JPEG, PNG, WEBP, or PDF.',
        type: 'error',
        position: 'bottom',
        visibilityTime: 2500,
      });
      return;
    }

    const sizeInBytes = Math.ceil((base64.length * 3) / 4);
    if (sizeInBytes > MAX_FILE_SIZE_BYTES) {
      showToast({
        text1: 'File is too large. Maximum size is 1MB.',
        type: 'error',
        position: 'bottom',
        visibilityTime: 2500,
      });
      return;
    }

    onChange({ kind: 'local', previewUri, base64, mimeType });
  };

  const takePhoto = async () => {
    closeOptions();
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showToast({
        text1: 'Camera permission is required to take a photo',
        type: 'error',
        position: 'bottom',
        visibilityTime: 2500,
      });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      base64: true,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset.base64) return;
    stageFile(asset.base64, asset.mimeType || 'image/jpeg', asset.uri);
  };

  const choosePhoto = async () => {
    closeOptions();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset.base64) return;
    stageFile(asset.base64, asset.mimeType || 'image/jpeg', asset.uri);
  };

  const choosePdf = async () => {
    closeOptions();
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf'] });
    if (result.canceled) return;

    const file = result.assets?.[0];
    if (!file) return;

    if (file.size && file.size > MAX_FILE_SIZE_BYTES) {
      showToast({
        text1: 'File is too large. Maximum size is 1MB.',
        type: 'error',
        position: 'bottom',
        visibilityTime: 2500,
      });
      return;
    }

    const base64 = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    stageFile(base64, 'application/pdf', file.uri);
  };

  const handleRemove = () => {
    onChange(null);
  };

  const handleView = () => {
    if (!displayUri) return;
    if (isPdf) {
      // A locally-staged PDF hasn't been uploaded yet, so there's no shareable URL for
      // it - its URI is a private app-cache path, and Android disallows exposing those
      // to other apps (e.g. a PDF viewer) via Intent. Only a `remote` (already-uploaded)
      // PDF can actually be opened.
      if (value?.kind !== 'remote') {
        showToast({
          text1: 'Save the transaction to view this PDF',
          type: 'info',
          position: 'bottom',
          visibilityTime: 2000,
        });
        return;
      }
      Linking.openURL(displayUri).catch((err) => {
        console.error('Failed to open PDF attachment', err);
        showToast({
          text1: 'Unable to open file. It may not be viewable yet.',
          type: 'error',
          position: 'bottom',
          visibilityTime: 2500,
        });
      });
    } else {
      setPreviewVisible(true);
    }
  };

  return (
    <>
      <RowField
        icon={
          <FontAwesome6
            name={value ? (isPdf ? 'file-pdf' : 'image') : 'paperclip'}
            size={16}
            color={colors.primary}
          />
        }
        label="Attachment"
        showDivider={showDivider}
        onPress={value ? handleView : openOptions}
        trailing={
          value ? (
            <TouchableOpacity onPress={handleRemove} hitSlop={10}>
              <FontAwesome6 name="xmark" size={16} color={colors.description} />
            </TouchableOpacity>
          ) : (
            <MaterialIcons name="chevron-right" size={20} color={colors.arrowColor} />
          )
        }>
        <Text
          style={[
            styles.attachmentText,
            { color: value ? colors.text : colors.inputPlaceholder },
          ]}
          numberOfLines={1}>
          {value
            ? `${isPdf ? 'Receipt.pdf' : 'Receipt image'}${value.kind === 'local' ? ' (not saved yet)' : ''}`
            : 'Add a receipt'}
        </Text>
      </RowField>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.cardBg }}
        handleIndicatorStyle={{ backgroundColor: colors.borderColor }}>
        <BottomSheetView style={[styles.sheetContent, { paddingBottom: 30 + insets.bottom }]}>
          <Text style={[styles.sheetTitle, { color: colors.title }]}>Attach Receipt</Text>

          <Pressable style={styles.optionRow} onPress={takePhoto}>
            <View style={[styles.optionIconBadge, { backgroundColor: colors.primary + '1A' }]}>
              <FontAwesome6 name="camera" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.optionText, { color: colors.title }]}>Take Photo</Text>
          </Pressable>

          <Pressable style={styles.optionRow} onPress={choosePhoto}>
            <View style={[styles.optionIconBadge, { backgroundColor: colors.primary + '1A' }]}>
              <FontAwesome6 name="image" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.optionText, { color: colors.title }]}>Choose Photo</Text>
          </Pressable>

          <Pressable style={styles.optionRow} onPress={choosePdf}>
            <View style={[styles.optionIconBadge, { backgroundColor: colors.primary + '1A' }]}>
              <FontAwesome6 name="file-pdf" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.optionText, { color: colors.title }]}>Choose PDF</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>

      <ModalCard visible={previewVisible} onClose={() => setPreviewVisible(false)} title="Receipt">
        {!!displayUri && !isPdf && (
          <Image source={{ uri: displayUri }} style={styles.previewImage} resizeMode="contain" />
        )}
      </ModalCard>
    </>
  );
}

const styles = StyleSheet.create({
  attachmentText: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-600',
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

  previewImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
});
