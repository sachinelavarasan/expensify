import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import ProfileHeader from '@/components/ProfileHeader';
import Emptystate from '@/components/Emptystate';
import OverlayLoader from '@/components/Overlay';
import Checkbox from '@/components/Checkbox';
import ImportSummaryCard from '@/components/ImportSummaryCard';
import { showToast } from '@/components/ToastMessage';
import { useRecurringTransactions, useImportRecurringTransactions } from '@/hooks/useRecurringTransaction';
import { recurringFrequencyType } from '@/utils/common-data';
import { formatToCurrency } from '@/utils/formatter';
import { getApiErrorMessage } from '@/lib/apiClient';
import { useThemeContext } from '@/contexts/ThemedContext';
import { IRecurringTransaction } from '@/types';
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
  const incomeItems = useMemo(
    () => activeTransactions.filter((item) => item.exp_rt_transaction_type_id === 2),
    [activeTransactions],
  );
  const expenseItems = useMemo(
    () => activeTransactions.filter((item) => item.exp_rt_transaction_type_id !== 2),
    [activeTransactions],
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);

  useEffect(() => {
    if (!hasInitializedSelection && !loading) {
      setSelectedIds(new Set(activeTransactions.map((item) => item.exp_rt_id)));
      setHasInitializedSelection(true);
    }
  }, [loading, hasInitializedSelection, activeTransactions]);

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

  const toggleGroup = (items: IRecurringTransaction[]) => {
    const allSelected = items.every((item) => selectedIds.has(item.exp_rt_id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      items.forEach((item) => {
        if (allSelected) {
          next.delete(item.exp_rt_id);
        } else {
          next.add(item.exp_rt_id);
        }
      });
      return next;
    });
  };

  const { selectedIncomeTotal, selectedExpenseTotal } = useMemo(() => {
    let incomeTotal = 0;
    let expenseTotal = 0;
    activeTransactions.forEach((item) => {
      if (!selectedIds.has(item.exp_rt_id)) return;
      if (item.exp_rt_transaction_type_id === 2) {
        incomeTotal += Number(item.exp_rt_amount);
      } else {
        expenseTotal += Number(item.exp_rt_amount);
      }
    });
    return { selectedIncomeTotal: incomeTotal, selectedExpenseTotal: expenseTotal };
  }, [activeTransactions, selectedIds]);

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
      .catch((err) => {
        showToast({ text1: getApiErrorMessage(err, 'Server Error'), type: 'error', position: 'bottom' });
      });
  };

  const renderRow = (item: IRecurringTransaction) => {
    const isSelected = selectedIds.has(item.exp_rt_id);
    const frequencyLabel =
      recurringFrequencyType.find((freq) => freq.id === item.exp_rt_frequency)?.label ||
      item.exp_rt_frequency;
    const iconColor = item.exp_tc_icon_bg_color || colors.categoryFallbackIcon;

    return (
      <TouchableOpacity
        key={item.exp_rt_id}
        activeOpacity={0.7}
        onPress={() => toggleSelected(item.exp_rt_id)}
        style={[
          styles.row,
          { backgroundColor: colors.cardBg, borderColor: isSelected ? colors.primary : colors.borderColor },
          !isSelected && styles.rowUnselected,
        ]}>
        <Checkbox checked={isSelected} onPress={() => toggleSelected(item.exp_rt_id)} />
        <View
          style={{
            backgroundColor: `${iconColor}2E`,
            padding: 8,
            borderRadius: 10,
          }}>
          <MaterialIcons
            name={item.exp_tc_icon as React.ComponentProps<typeof MaterialIcons>['name']}
            size={20}
            color={iconColor}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.title }]} numberOfLines={1}>
            {item.exp_rt_title}
          </Text>
          <Text style={[styles.subText, { color: colors.lighterTitle, marginTop: 2 }]} numberOfLines={1}>
            {item.exp_tc_label} · {frequencyLabel}
          </Text>
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
  };

  const renderGroup = (title: string, items: IRecurringTransaction[]) => {
    if (items.length === 0) return null;
    const selectedCount = items.filter((item) => selectedIds.has(item.exp_rt_id)).length;
    const allSelected = selectedCount === items.length;

    return (
      <View style={{ marginTop: 16 }}>
        <View style={styles.groupHead}>
          <View style={styles.groupLabelRow}>
            <Text style={[styles.groupLabel, { color: colors.lighterTitle }]}>{title}</Text>
            <View style={[styles.countPill, { backgroundColor: colors.inputColor }]}>
              <Text style={[styles.countText, { color: colors.description }]}>
                {selectedCount}/{items.length}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => toggleGroup(items)}>
            <Text style={[styles.groupToggle, { color: colors.primary }]}>
              {allSelected ? 'Deselect all' : 'Select all'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ gap: 8 }}>{items.map(renderRow)}</View>
      </View>
    );
  };

  return (
    <SafeAreaViewComponent>
      <View style={{ flex: 1 }}>
        {(loading || isImporting) && <OverlayLoader />}
        <ThemedView style={{ flex: 1, paddingHorizontal: 5 }}>
          <ProfileHeader title="Import Recurring" />

          <FlatList
            bounces={false}
            showsVerticalScrollIndicator={false}
            data={[1]}
            keyExtractor={() => 'page-wrapper'}
            renderItem={null as any}
            contentContainerStyle={{ paddingBottom: 50, paddingTop: 5, paddingHorizontal: 15 }}
            ListHeaderComponent={
              activeTransactions.length === 0 ? (
                <Emptystate
                  title="No recurring transactions to import"
                  description="Active recurring transactions you add will show up here at the start of every month."
                />
              ) : (
                <>
                  <ImportSummaryCard
                    count={selectedIds.size}
                    income={selectedIncomeTotal}
                    expense={selectedExpenseTotal}
                  />
                  {renderGroup('Income', incomeItems)}
                  {renderGroup('Expenses', expenseItems)}
                </>
              )
            }
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
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  groupLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupLabel: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  countPill: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  countText: {
    fontSize: 10,
    fontFamily: 'Inter-700',
  },
  groupToggle: {
    fontSize: 12,
    fontFamily: 'Inter-700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
  },
  rowUnselected: {
    opacity: 0.5,
  },
  name: {
    fontSize: 13.5,
    fontFamily: 'Inter-600',
  },
  subText: {
    fontSize: 11,
    fontFamily: 'Inter-400',
  },
  amount: {
    fontSize: 14,
    fontFamily: 'Inter-700',
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
