import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Entypo } from '@expo/vector-icons';

import { useThemeContext } from '@/contexts/ThemedContext';

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
}

export default function TagInput({ value, onChange, label, placeholder = 'Add a tag' }: Props) {
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

  return (
    <View>
      {!!label && <Text style={[styles.label, { color: colors.title }]}>{label}</Text>}
      <View
        style={[
          styles.inputRow,
          { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
        ]}>
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
          style={[styles.input, { color: colors.text }]}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
        />
      </View>
      {value.length > 0 && (
        <View style={styles.chipRow}>
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
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
