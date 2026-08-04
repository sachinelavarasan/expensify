import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { QueryObserverResult } from '@tanstack/react-query';

import ProfileImageUploader from './ProfileUpload';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';
import { IExpUser } from '@/types';

type Props = {
  title: string;
  subtitle?: string;
  refetch: () => Promise<QueryObserverResult<IExpUser, Error>>;
};

export default function ProfileHeaderCard({ title, subtitle, refetch }: Props) {
  const { colors } = useThemeContext();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
      ]}>
      <ProfileImageUploader refetch={refetch} />
      <View style={styles.textOverlay}>
        <Text style={[styles.name, { color: colors.title }]} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={[styles.email, { color: colors.description }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  textOverlay: {
    flex: 1,
    flexShrink: 1,
  },
  name: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-700',
  },
  email: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    marginTop: 1,
  },
});
