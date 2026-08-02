import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { deviceHeight, deviceWidth } from '@/utils/functions';
import { useThemeContext } from '@/contexts/ThemedContext';

const width = deviceWidth();
const height = deviceHeight();

interface Props {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  closeDisabled?: boolean;
  contentStyle?: ViewStyle;
}

export default function ModalCard({
  visible,
  onClose,
  title,
  children,
  closeDisabled,
  contentStyle,
}: Props) {
  const { theme, colors } = useThemeContext();

  return (
    <Modal
      customBackdrop={
        <BlurView
          tint={theme === 'dark' ? 'dark' : 'light'}
          intensity={40}
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}
        />
      }
      isVisible={visible}
      hasBackdrop
      deviceHeight={height}
      deviceWidth={width}
      animationIn="zoomIn"
      animationOut="zoomOut"
      animationInTiming={220}
      animationOutTiming={180}
      useNativeDriver
      useNativeDriverForBackdrop
      avoidKeyboard
      onBackButtonPress={closeDisabled ? undefined : onClose}
      coverScreen>
      <View style={styles.wrapper}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardBg, shadowColor: colors.shadow },
            contentStyle,
          ]}>
          {!!title && (
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.title }]} numberOfLines={1}>
                {title}
              </Text>
              {!!onClose && (
                <TouchableOpacity
                  onPress={onClose}
                  disabled={closeDisabled}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={[
                    styles.closeButton,
                    { backgroundColor: colors.inputColor, opacity: closeDisabled ? 0.4 : 1 },
                  ]}>
                  <Ionicons name="close" color={colors.title} size={18} />
                </TouchableOpacity>
              )}
            </View>
          )}
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width - 60,
    maxHeight: height * 0.8,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 22,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-600',
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
