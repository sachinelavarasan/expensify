import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { QueryObserverResult } from '@tanstack/react-query';
import { format } from 'date-fns';

import ProfileImageUploader from './ProfileUpload';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';
import { IExpUser } from '@/types';

const AVATAR_SIZE = 64;
const RING_WIDTH = 2.5;
const RING_GAP = 3;
const HALO_SIZE = AVATAR_SIZE + (RING_WIDTH + RING_GAP) * 2;
const RING_SIZE = AVATAR_SIZE + RING_WIDTH * 2;
// Empty gradient band above the avatar before the profile row starts.
const STRIP_TOP = 20;

// floatingBtnBg is a fixed deep-indigo gradient in both themes, so text on the
// strip is always light - we can't use colors.onPrimary here (it flips per
// theme and would go dark-on-indigo in dark mode).
const STRIP_TEXT = '#FFFFFF';
const STRIP_TEXT_DIM = 'rgba(255, 255, 255, 0.85)';
const STRIP_CHIP_BG = 'rgba(255, 255, 255, 0.16)';

type Props = {
  title: string;
  subtitle?: string;
  verified?: boolean;
  createdAt?: string;
  refetch: () => Promise<QueryObserverResult<IExpUser, Error>>;
};

export default function ProfileHeaderCard({
  title,
  subtitle,
  verified,
  createdAt,
  refetch,
}: Props) {
  const { colors } = useThemeContext();

  return (
    <View
      style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
      <LinearGradient colors={colors.floatingBtnBg as [string, string]} style={styles.strip}>
        <View style={styles.profileRow}>
          <View style={styles.avatarCol}>
            <View style={[styles.avatarHalo, { backgroundColor: colors.cardBg }]}>
              <LinearGradient
                colors={colors.floatingBtnBg as [string, string]}
                style={styles.avatarRing}>
                <ProfileImageUploader refetch={refetch} size={AVATAR_SIZE} bordered={false} />
              </LinearGradient>
            </View>
          </View>

          <View style={styles.nameCol}>
            {verified && (
              <View style={[styles.verifiedChip, { backgroundColor: STRIP_CHIP_BG }]}>
                <MaterialIcons name="verified" size={12} color={STRIP_TEXT} />
                <Text style={[styles.verifiedText, { color: STRIP_TEXT }]}>Verified account</Text>
              </View>
            )}
            <Text style={[styles.name, { color: STRIP_TEXT }]} numberOfLines={1}>
              {title}
            </Text>
            {!!subtitle && (
              <View style={styles.metaRow}>
                <MaterialIcons name="mail-outline" size={13} color={STRIP_TEXT_DIM} />
                <Text style={[styles.email, { color: STRIP_TEXT_DIM }]} numberOfLines={1}>
                  {subtitle}
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {!!createdAt && (
        <View style={[styles.body, { borderTopColor: colors.borderColor }]}>
          <View style={styles.sinceRow}>
            <MaterialIcons name="calendar-today" size={12} color={colors.lighterTitle} />
            <Text style={[styles.sinceText, { color: colors.lighterTitle }]}>
              Member since {format(new Date(createdAt), 'MMM yyyy')}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  strip: {
    paddingTop: STRIP_TOP,
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  body: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarCol: {
    // Fixed to the halo width so a narrow screen can't clip the avatar (the
    // card clips overflow). Negative margin lets just the avatar poke up into
    // the empty gradient band above the row.
    width: HALO_SIZE,
    alignItems: 'flex-start',
    // marginTop: -(HALO_SIZE / 2 + 8),
  },
  nameCol: {
    flex: 1,
    marginLeft: 14,
    paddingTop: 4,
  },
  avatarHalo: {
    width: HALO_SIZE,
    height: HALO_SIZE,
    borderRadius: HALO_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 3,
    paddingLeft: 6,
    paddingRight: 8,
    borderRadius: 100,
    marginBottom: 6,
  },
  verifiedText: {
    fontSize: FontSize.xs,
    fontFamily: 'Inter-700',
  },
  name: {
    fontSize: FontSize.lg,
    fontFamily: 'Inter-800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  email: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    letterSpacing: 0.1,
    flexShrink: 1,
  },
  sinceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sinceText: {
    fontSize: FontSize.xs,
    fontFamily: 'Inter-600',
  },
});
