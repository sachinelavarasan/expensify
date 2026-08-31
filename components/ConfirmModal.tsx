import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ModalCard from '@/components/ModalCard';
import { useThemeContext } from '@/contexts/ThemedContext';
import { Spacing } from '@/utils/Spacing';
import { FontSize } from '@/utils/Typography';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  // Omit to render a single dismiss button (native Alert.alert(title, message)
  // equivalent) instead of a Cancel/Confirm pair.
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Themed stand-in for Alert.alert/Alert.alert(title, message, [...]) - no
// native dialog ever matches the app's dark theme, so every confirmation (and
// plain heads-up) goes through this one component via the useConfirm hook
// instead. Deliberately given no `onClose` on the underlying ModalCard: with
// no X button and no backdrop/back-button dismiss, the only way out is one of
// the buttons below, same as a native Alert.
export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  destructive,
  onConfirm,
  onCancel,
}: Props) {
  const { colors } = useThemeContext();
  const hasCancel = !!cancelText;

  return (
    <ModalCard visible={visible} title={title} closeDisabled>
      {!!message && (
        <Text style={[styles.message, { color: colors.description }]}>{message}</Text>
      )}
      <View style={styles.buttonRow}>
        {hasCancel && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.inputColor }]}
            onPress={onCancel}>
            <Text style={[styles.buttonText, { color: colors.title }]}>{cancelText}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: destructive ? colors.expense : colors.primary },
          ]}
          onPress={onConfirm}>
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
            {confirmText || (hasCancel ? 'Confirm' : 'OK')}
          </Text>
        </TouchableOpacity>
      </View>
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  message: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-400',
    marginBottom: Spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: FontSize.md,
    fontFamily: 'Inter-600',
  },
});
