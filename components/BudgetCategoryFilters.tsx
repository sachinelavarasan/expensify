import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';

export type BudgetCategoryFilter = 'all' | 'over' | 'unbudgeted';

const FILTERS: { key: BudgetCategoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'over', label: 'Over Budget' },
  { key: 'unbudgeted', label: 'Not Budgeted' },
];

export default function BudgetCategoryFilters({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  filter: BudgetCategoryFilter;
  onFilterChange: (value: BudgetCategoryFilter) => void;
}) {
  const { colors } = useThemeContext();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.search,
          {
            backgroundColor: colors.inputColor,
            borderColor: focused ? colors.borderSelected : colors.inputBorder,
          },
        ]}>
        <Feather
          name="search"
          size={16}
          color={focused ? colors.primary : colors.lighterTitle}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.title }]}
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search categories"
          placeholderTextColor={colors.inputPlaceholder}
          selectionColor={colors.primary + '40'}
          cursorColor={colors.secondary}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="search"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {search.length > 0 ? (
          <TouchableOpacity onPress={() => onSearchChange('')} hitSlop={10}>
            <Ionicons name="close-circle" size={17} color={colors.lighterTitle} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.chipRow}>
        {FILTERS.map((item) => {
          const active = filter === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.8}
              onPress={() => onFilterChange(active ? 'all' : item.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.inputColor,
                  borderColor: active ? colors.primary : colors.inputBorder,
                },
              ]}>
              <Text
                style={[styles.chipText, { color: active ? colors.onPrimary : colors.description }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    gap: 10,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.base,
    fontFamily: 'Inter-400',
    paddingVertical: 0,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-600',
  },
});
