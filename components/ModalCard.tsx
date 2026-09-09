import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  // 'sheet' anchors the card to the bottom edge (slide up/down, full width,
  // top-corners-only radius, drag handle) instead of the default centered
  // zoom-in card - opt-in so every other ModalCard consumer is unaffected.
  presentation?: 'center' | 'sheet';
  // Rendered below the scrollable content, pinned to the bottom of the card
  // instead of scrolling away with it - use for primary actions (e.g. "Apply")
  // on long forms so they stay reachable without scrolling to the end.
  footer?: React.ReactNode;
  // Small count pill next to the title (e.g. number of active filters) -
  // omitted entirely when falsy/zero so callers can pass a raw count.
  badge?: number;
}

export default function ModalCard({
  visible,
  onClose,
  title,
  children,
  closeDisabled,
  contentStyle,
  presentation = 'center',
  footer,
  badge,
}: Props) {
  const { theme, colors } = useThemeContext();
  const insets = useSafeAreaInsets();
  const isSheet = presentation === 'sheet';

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
      animationIn={isSheet ? 'slideInUp' : 'zoomIn'}
      animationOut={isSheet ? 'slideOutDown' : 'zoomOut'}
      animationInTiming={220}
      animationOutTiming={180}
      useNativeDriver
      useNativeDriverForBackdrop
      avoidKeyboard
      onBackButtonPress={closeDisabled ? undefined : onClose}
      onBackdropPress={closeDisabled ? undefined : onClose}
      style={isSheet ? styles.modalSheet : undefined}
      coverScreen>
      <View style={[styles.wrapper, isSheet && styles.wrapperSheet]} pointerEvents="box-none">
        <View
          style={[
            styles.card,
            isSheet && styles.cardSheet,
            isSheet && { paddingBottom: 22 + insets.bottom },
            { backgroundColor: colors.cardBg, shadowColor: colors.shadow },
            contentStyle,
          ]}>
          {isSheet && <View style={[styles.handle, { backgroundColor: colors.inputBorder }]} />}
          {!!title && (
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: colors.title }]} numberOfLines={1}>
                  {title}
                </Text>
                {!!badge && (
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.badgeText, { color: colors.onPrimary }]}>{badge}</Text>
                  </View>
                )}
              </View>
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
          {!!footer && (
            <View style={[styles.footer, { borderTopColor: colors.inputBorder }]}>{footer}</View>
          )}
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
  wrapperSheet: {
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  modalSheet: {
    margin: 0,
    justifyContent: 'flex-end',
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
  cardSheet: {
    width: '100%',
    maxHeight: height * 0.8,
    borderRadius: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom: 22,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-600',
    flexShrink: 1,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter-700',
  },
  footer: {
    marginTop: 12,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
