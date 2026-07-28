import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import ProfileHeader from '@/components/ProfileHeader';
import Emptystate from '@/components/Emptystate';
import OverlayLoader from '@/components/Overlay';
import { showToast } from '@/components/ToastMessage';
import { useRecurringTransactions, useImportRecurringTransactions } from '@/hooks/useRecurringTransaction';
import { recurringFrequencyType } from '@/utils/common-data';
import { formatToCurrency } from '@/utils/formatter';
import { useThemeContext } from '@/contexts/ThemedContext';
import { Spacing } from '@/utils/Spacing';
import { FontSize } from '@/utils/Typography';

export default function ImportRecurringTransactions() {
  const { colors } = useThemeContext();
  const router = useRouter();
  const { recurringTransactions, loading } = useRecurringTransactions();
  const { mutateAsync: importRecurringTransactions, isPending: isImporting } =
    useImportRecurringTransactions();

  const activeTransactions = useMemo(
    () => recurringTransactions.filter((item) => item.exp_rt_is_active),
    [recurringTransactions],
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);

  useEffect(() => {
    if (!hasInitializedSelection && !loading) {
      setSelectedIds(new Set(activeTransactions.map((item) => item.exp_rt_id)));
      setHasInitializedSelection(true);
    }
  }, [loading, hasInitializedSelection, activeTransactions]);

  const allSelected = selectedIds.size === activeTransactions.length && activeTransactions.length > 0;

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(activeTransactions.map((item) => item.exp_rt_id)));
    }
  };

  const handleImport = () => {
    importRecurringTransactions(Array.from(selectedIds))
      .then((result) => {
        showToast({
          text1: `Imported ${result.imported} transaction${result.imported === 1 ? '' : 's'}`,
          type: 'success',
          position: 'bottom',
        });
        router.back();
      })
      .catch(() => {
        showToast({ text1: 'Server Error', type: 'error', position: 'bottom' });
      });
  };

  return (
    <SafeAreaViewComponent>
      <View style={{ flex: 1 }}>
        {(loading || isImporting) && <OverlayLoader />}
        <ThemedView style={{ flex: 1, paddingHorizontal: 5 }}>
          <ProfileHeader title="Import Recurring">
            {activeTransactions.length > 0 && (
              <TouchableOpacity onPress={toggleSelectAll}>
                <Text style={[styles.selectAll, { color: colors.primary }]}>
                  {allSelected ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
            )}
          </ProfileHeader>

          <FlatList
            bounces={false}
            showsVerticalScrollIndicator={false}
            data={activeTransactions}
            contentContainerStyle={{ paddingBottom: 50, paddingTop: 5, paddingHorizontal: 15 }}
            ListEmptyComponent={
              <Emptystate
                title="No recurring transactions to import"
                description="Active recurring transactions you add will show up here at the start of every month."
              />
            }
            renderItem={({ item }) => {
              const isSelected = selectedIds.has(item.exp_rt_id);
              const frequencyLabel =
                recurringFrequencyType.find((freq) => freq.id === item.exp_rt_frequency)?.label ||
                item.exp_rt_frequency;

              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleSelected(item.exp_rt_id)}
                  style={styles.row}>
                  <MaterialIcons
                    name={isSelected ? 'check-box' : 'check-box-outline-blank'}
                    size={22}
                    color={isSelected ? colors.primary : colors.description}
                  />
                  <View
                    style={{
                      backgroundColor: item.exp_tc_icon_bg_color || colors.categoryFallbackBg,
                      padding: 8,
                      borderRadius: 5,
                    }}>
                    <MaterialIcons
                      name={item.exp_tc_icon as React.ComponentProps<typeof MaterialIcons>['name']}
                      size={24}
                      color={colors.categoryFallbackIcon}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: colors.title }]} numberOfLines={2}>
                      {item.exp_rt_title}
                    </Text>
                    <View style={styles.subTextContainer}>
                      <Text
                        style={[
                          styles.subText,
                          { fontFamily: 'Inter-500', color: colors.lighterTitle, marginRight: 6 },
                        ]}>
                        {item.exp_tc_label}
                      </Text>
                      <Text
                        style={[styles.subText, { fontFamily: 'Inter-500', color: colors.description }]}>
                        <Text>{'•'}</Text> {frequencyLabel}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.amount,
                      { color: item.exp_rt_transaction_type_id === 2 ? colors.income : colors.expense },
                    ]}>
                    {item.exp_rt_transaction_type_id === 2 ? '+' : '-'}
                    {formatToCurrency(item.exp_rt_amount)}
                  </Text>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.exp_rt_id.toString()}
          />
        </ThemedView>

        <View style={[styles.footer, { backgroundColor: colors.barBackground }]}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              selectedIds.size === 0 || isImporting ? styles.disable : {},
            ]}
            disabled={selectedIds.size === 0 || isImporting}
            onPress={handleImport}>
            {isImporting ? (
              <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
            ) : null}
            <Text
              style={[styles.title, { color: colors.onPrimary }, isImporting ? styles.textDisable : {}]}>
              Import ({selectedIds.size})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaViewComponent>
  );
}

const styles = StyleSheet.create({
  selectAll: {
    fontSize: 13,
    fontFamily: 'Inter-600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  name: {
    fontSize: 14,
    fontFamily: 'Inter-600',
  },
  subText: {
    fontSize: 12,
    fontFamily: 'Inter-400',
  },
  subTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  amount: {
    fontSize: 12,
    fontFamily: 'Inter-600',
  },
  footer: {
    elevation: 10,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 50,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 9,
    width: '100%',
  },
  loader: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.md,
    fontFamily: 'Inter-600',
  },
  disable: {
    opacity: 0.7,
  },
  textDisable: { opacity: 0 },
});
