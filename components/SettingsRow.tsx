import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';

interface Props {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  style?: ViewStyle;
  // When true, renders as a flat list item (no border/radius/margin of its
  // own) meant to sit inside a shared group card instead of its own box.
  noCard?: boolean;
  // Adds a top hairline when grouped with noCard - used for every row after
  // the first inside a group card, in place of a real CSS adjacent-sibling rule.
  topDivider?: boolean;
}

export default function SettingsRow({
  icon,
  iconBg,
  title,
  subtitle,
  onPress,
  right,
  style,
  noCard,
  topDivider,
}: Props) {
  const { colors } = useThemeContext();
  const Wrapper: any = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      {...(onPress ? { onPress, activeOpacity: 0.7 } : {})}
      style={[
        noCard ? styles.rowFlat : styles.card,
        noCard
          ? topDivider && { borderTopWidth: 1, borderTopColor: colors.borderColor }
          : { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
        style,
      ]}>
      <View style={styles.left}>
        <View style={[styles.iconBadge, { backgroundColor: iconBg ?? colors.primary }]}>
          {icon}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.title }]} numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && (
            <Text style={[styles.subtitle, { color: colors.description }]} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {right !== undefined
        ? right
        : !!onPress && <MaterialIcons name="chevron-right" size={20} color={colors.lighterTitle} />}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  rowFlat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: FontSize.base, fontFamily: 'Inter-600' },
  subtitle: { fontSize: FontSize.sm, fontFamily: 'Inter-500', marginTop: 2 },
});
