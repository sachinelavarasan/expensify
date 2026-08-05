import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import SearchBar from './SearchBar';
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

  return (
    <View style={styles.container}>
      <SearchBar searchPhrase={search} onChange={onSearchChange} />
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
              <Text style={[styles.chipText, { color: active ? colors.onPrimary : colors.description }]}>
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
