import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import ProfileHeader from '@/components/ProfileHeader';
import Emptystate from '@/components/Emptystate';
import OverlayLoader from '@/components/Overlay';
import DebtCard from '@/components/DebtCard';
import AddDebt from '@/components/AddDebt';
import Spacer from '@/components/Spacer';
import { useDebts } from '@/hooks/useDebts';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';

type FilterKey = 'all' | 'owed_to_me' | 'owed_by_me';

export default function Debts() {
  const { colors } = useThemeContext();
  const router = useRouter();
  const { debts, loading, refetch } = useDebts();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const filteredDebts = useMemo(() => {
    if (filter === 'all') return debts;
    return debts.filter((d) => d.exp_dt_direction === filter);
  }, [debts, filter]);

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'owed_to_me', label: 'Owed to me' },
    { key: 'owed_by_me', label: 'I owe' },
  ];

  return (
    <SafeAreaViewComponent>
      <ThemedView style={{ flex: 1, paddingHorizontal: 5 }}>
        {loading && <OverlayLoader />}
        <ProfileHeader title="Debts & Loans">
          <AddDebt />
        </ProfileHeader>

        <View style={styles.filterRow}>
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.inputColor,
                    borderColor: colors.inputBorder,
                  },
                ]}
                onPress={() => setFilter(f.key)}>
                <Text
                  style={[
                    styles.filterChipText,
                    { color: active ? colors.onPrimary : colors.description },
                  ]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <FlatList
          bounces={false}
          showsVerticalScrollIndicator={false}
          data={filteredDebts}
          contentContainerStyle={{ paddingBottom: 50, paddingTop: 10, paddingHorizontal: 15 }}
          ItemSeparatorComponent={() => <Spacer height={10} />}
          ListEmptyComponent={
            <Emptystate
              title="No debts or loans yet"
              description="Track money you've lent or borrowed and log repayments over time."
            />
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <DebtCard debt={item} onPress={() => router.push(`/debts/${item.exp_dt_id}`)} />
          )}
          keyExtractor={(item) => item.exp_dt_id}
        />
      </ThemedView>
    </SafeAreaViewComponent>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  filterChipText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
  },
});
