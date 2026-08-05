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
const COVER_HEIGHT = 56;

type Props = {
  title: string;
  subtitle?: string;
  verified?: boolean;
  createdAt?: string;
  refetch: () => Promise<QueryObserverResult<IExpUser, Error>>;
};

export default function ProfileHeaderCard({ title, subtitle, verified, createdAt, refetch }: Props) {
  const { colors } = useThemeContext();

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
      <LinearGradient colors={colors.floatingBtnBg as [string, string]} style={styles.cover} />

      <View style={styles.body}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatarHalo, { backgroundColor: colors.cardBg }]}>
            <LinearGradient colors={colors.floatingBtnBg as [string, string]} style={styles.avatarRing}>
              <ProfileImageUploader refetch={refetch} size={AVATAR_SIZE} bordered={false} />
            </LinearGradient>
          </View>
        </View>

        <View style={styles.nameBlock}>
          {verified && (
            <View style={[styles.verifiedChip, { backgroundColor: `${colors.primary}1A` }]}>
              <MaterialIcons name="verified" size={12} color={colors.primary} />
              <Text style={[styles.verifiedText, { color: colors.primary }]}>Verified account</Text>
            </View>
          )}
          <Text style={[styles.name, { color: colors.title }]} numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && (
            <View style={styles.metaRow}>
              <MaterialIcons name="mail-outline" size={13} color={colors.description} />
              <Text style={[styles.email, { color: colors.description }]} numberOfLines={1}>
                {subtitle}
              </Text>
            </View>
          )}
        </View>

        {!!createdAt && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.borderColor }]} />
            <View style={styles.sinceRow}>
              <MaterialIcons name="calendar-today" size={12} color={colors.lighterTitle} />
              <Text style={[styles.sinceText, { color: colors.lighterTitle }]}>
                Member since {format(new Date(createdAt), 'MMM yyyy')}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cover: {
    height: COVER_HEIGHT,
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  avatarRow: {
    marginTop: -(HALO_SIZE / 2),
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
  nameBlock: {
    marginTop: 10,
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
    marginTop: 3,
  },
  email: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    flexShrink: 1,
  },
  divider: {
    height: 1,
    marginTop: 12,
    marginBottom: 10,
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
