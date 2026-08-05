import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';
import { Spacing } from '@/utils/Spacing';

interface Props {
  icon?: React.ReactNode;
  label?: string;
  error?: string | null;
  trailing?: React.ReactNode;
  showDivider?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
}

// Shared visual shell for a single "row" field inside a card - icon, label +
// value, optional trailing accessory/chevron, hairline divider. RowInput,
// RowSelectInput, RowDatePicker and RowTimePicker each supply their own
// interactive content into this same shell so every field in a card reads
// as one consistent row style instead of a mix of boxed inputs.
export default function RowField({
  icon,
  label,
  error,
  trailing,
  showDivider = true,
  onPress,
  children,
}: Props) {
  const { colors } = useThemeContext();
  const Container: any = onPress ? TouchableOpacity : View;

  return (
    <View>
      <Container
        {...(onPress ? { onPress, activeOpacity: 0.6 } : {})}
        style={[
          styles.row,
          showDivider && {
            borderBottomWidth: 1,
            borderBottomColor: error ? colors.expense : colors.borderColor,
          },
        ]}>
        {icon ? (
          <View style={[styles.icon, { backgroundColor: colors.barBackground }]}>{icon}</View>
        ) : null}
        <View style={styles.content}>
          {label ? (
            <Text style={[styles.label, { color: colors.description }]}>{label}</Text>
          ) : null}
          {children}
        </View>
        {trailing}
      </Container>
      {error ? <Text style={[styles.error, { color: colors.expense }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: FontSize.xs,
    fontFamily: 'Inter-500',
    marginBottom: 2,
  },
  error: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-300',
    letterSpacing: 0.5,
    paddingTop: 4,
  },
});
