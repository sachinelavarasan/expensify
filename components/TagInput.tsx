import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Entypo, MaterialIcons } from '@expo/vector-icons';

import RowField from '@/components/RowField';
import { useThemeContext } from '@/contexts/ThemedContext';
import { Spacing } from '@/utils/Spacing';

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
  // Drops the field's own bordered/background box in favor of sitting
  // directly on whatever container it's placed in - for use inside an
  // already-bordered card, where a box-in-a-box look would be redundant.
  flat?: boolean;
  showDivider?: boolean;
}

export default function TagInput({
  value,
  onChange,
  label,
  placeholder = 'Add a tag',
  flat = false,
  showDivider,
}: Props) {
  const { colors } = useThemeContext();
  const [draftText, setDraftText] = useState('');

  const commitTag = () => {
    const trimmed = draftText.trim();
    if (!trimmed || value.includes(trimmed)) {
      setDraftText('');
      return;
    }
    onChange([...value, trimmed]);
    setDraftText('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const textInput = (
    <TextInput
      value={draftText}
      onChangeText={(text) => {
        if (text.endsWith(',')) {
          setDraftText(text.slice(0, -1));
          commitTag();
          return;
        }
        setDraftText(text);
      }}
      onSubmitEditing={commitTag}
      onBlur={commitTag}
      placeholder={placeholder}
      placeholderTextColor={colors.inputPlaceholder}
      style={[styles.input, { color: colors.text }, flat && styles.inputFlat]}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="done"
    />
  );

  return (
    <View>
      {flat ? (
        <RowField
          icon={<MaterialIcons name="local-offer" size={17} color={colors.primary} />}
          label={label}
          showDivider={showDivider}>
          {textInput}
        </RowField>
      ) : (
        <>
          {!!label && <Text style={[styles.label, { color: colors.title }]}>{label}</Text>}
          <View
            style={[
              styles.inputRow,
              { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
            ]}>
            {textInput}
          </View>
        </>
      )}
      {value.length > 0 && (
        <View style={[styles.chipRow, flat && styles.chipRowFlat]}>
          {value.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.chip, { borderColor: colors.primary }]}
              onPress={() => removeTag(tag)}>
              <Text style={{ color: colors.secondary, fontFamily: 'Inter-500' }}>{tag}</Text>
              <Entypo name="cross" size={16} color={colors.secondary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontFamily: 'Inter-500',
  },
  inputRow: {
    borderWidth: 1,
    borderRadius: 8,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Inter-400',
  },
  inputFlat: {
    padding: 0,
    fontFamily: 'Inter-600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chipRowFlat: {
    marginTop: Spacing.md,
  },
  chip: {
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});
