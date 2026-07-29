import { ColorValue, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import Spacer from './Spacer';
import ModalCard from './ModalCard';
import Input from './Input';
import TagInput from './TagInput';
import CategorySelector from './CategorySelector';
import { FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { transactionExportType } from '@/utils/common-data';
import SearchBar from './SearchBar';
import CustomRadioButton from './CustomRadioButton';
import DatePickerWithOutValue from './DatePickerWithOutValue';
import { useThemeContext } from '@/contexts/ThemedContext';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomSelectInput } from './CustomSelectInput';
import { BankAccount, ICategory } from '@/types';
import { DATE_RANGE_PRESETS, DateRangePresetId, getPresetRange } from '@/utils/functions';

type CustomDateRange = { start: string; end: string } | null;

interface Props {
  selectedTransaction: string;
  searchText: string;
  applyFilters: (
    search: string,
    transactionType: string,
    bankAccount: number | string,
    extras: {
      tags: string[];
      customDateRange: CustomDateRange;
      minAmount: string;
      maxAmount: string;
      categoryIds: string[];
    },
  ) => void;
  accounts: BankAccount[];
  categories: ICategory[];
  selectedAccount: number | string;
  selectedTags?: string[];
  selectedDateRange?: CustomDateRange;
  selectedMinAmount?: string;
  selectedMaxAmount?: string;
  selectedCategoryIds?: string[];
  hasActiveFilters?: boolean;
}

const TransactionFilters = ({
  selectedTransaction,
  searchText,
  selectedAccount,
  applyFilters,
  accounts,
  categories,
  selectedTags = [],
  selectedDateRange = null,
  selectedMinAmount = '',
  selectedMaxAmount = '',
  selectedCategoryIds = [],
  hasActiveFilters = false,
}: Props) => {
  const { colors } = useThemeContext();
  const [show, setShow] = useState(false);
  const primaryAccountId = accounts.find((account) => account.exp_ba_is_primary)?.exp_ba_id;

  const draftFromProps = () => ({
    search: searchText,
    transactionType: selectedTransaction,
    bankAccount: selectedAccount || primaryAccountId || '',
    tags: selectedTags,
    customDateRange: selectedDateRange,
    minAmount: selectedMinAmount,
    maxAmount: selectedMaxAmount,
    categoryIds: selectedCategoryIds,
  });
  const [draft, setDraft] = useState(draftFromProps);
  const [datePreset, setDatePreset] = useState<DateRangePresetId | 'none'>(
    selectedDateRange ? 'custom' : 'none',
  );

  const openModal = () => {
    setDraft(draftFromProps());
    setDatePreset(selectedDateRange ? 'custom' : 'none');
    setShow(true);
  };
  const closeModal = () => setShow(false);

  const selectDatePreset = (id: DateRangePresetId) => {
    setDatePreset(id);
    if (id === 'custom') return;
    const range = getPresetRange(id);
    setDraft((prev) => ({ ...prev, customDateRange: range }));
  };

  const clearDateRange = () => {
    setDatePreset('none');
    setDraft((prev) => ({ ...prev, customDateRange: null }));
  };

  const sanitizeAmount = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const [whole, ...rest] = cleaned.split('.');
    return rest.length ? `${whole}.${rest.join('')}` : whole;
  };

  const toggleCategory = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }));
  };

  const handlePress = () => {
    if (
      !draft.search.trim() &&
      !draft.transactionType &&
      !draft.bankAccount &&
      !draft.tags.length &&
      !draft.customDateRange &&
      !draft.minAmount &&
      !draft.maxAmount &&
      !draft.categoryIds.length
    ) {
      return;
    }
    applyFilters(draft.search, draft.transactionType, draft.bankAccount, {
      tags: draft.tags,
      customDateRange: draft.customDateRange,
      minAmount: draft.minAmount,
      maxAmount: draft.maxAmount,
      categoryIds: draft.categoryIds,
    });
    closeModal();
  };

  return (
    <>
      <TouchableOpacity
        onPress={openModal}
        style={[
          styles.trigger,
          {
            backgroundColor: hasActiveFilters ? colors.primary : colors.inputColor,
            borderColor: hasActiveFilters ? colors.primary : colors.inputBorder,
          },
        ]}>
        <FontAwesome6
          name="filter"
          size={14}
          color={hasActiveFilters ? colors.onPrimary : colors.arrowColor}
        />
      </TouchableOpacity>

      <ModalCard visible={show} onClose={closeModal} title="Apply Filters">
        <SearchBar
          searchPhrase={draft.search}
          onChange={(e: any) => {
            setDraft((prev) => ({ ...prev, search: e }));
          }}
        />
        <Spacer height={20} />

        <View style={styles.card}>
          <CustomRadioButton
            label="Transaction Type"
            value={draft.transactionType}
            options={transactionExportType}
            onChange={(data) => {
              setDraft((prev) => ({ ...prev, transactionType: data as string, categoryIds: [] }));
            }}
          />
        </View>
        <Spacer height={15} />
        <View style={{ paddingHorizontal: 5 }}>
          <CustomSelectInput
            value={draft.bankAccount}
            options={accounts.map((account) => ({
              key: account.exp_ba_id,
              value: account.exp_ba_name,
            }))}
            label="Bank Account"
            onChange={(selectId) => setDraft((prev) => ({ ...prev, bankAccount: selectId }))}
          />
        </View>
        <Spacer height={20} />

        <View style={{ paddingHorizontal: 5 }}>
          <TagInput
            value={draft.tags}
            onChange={(tags) => setDraft((prev) => ({ ...prev, tags }))}
            label="Tags"
          />
        </View>
        <Spacer height={20} />

        <View style={{ paddingHorizontal: 5 }}>
          <Text style={[styles.label, { color: colors.title }]}>Date Range</Text>
          <View style={styles.chipRow}>
            {DATE_RANGE_PRESETS.map((item) => {
              const selected = datePreset === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => selectDatePreset(item.id)}
                  style={[
                    styles.dateChip,
                    {
                      backgroundColor: selected ? colors.primary : colors.inputColor,
                      borderColor: selected ? colors.primary : colors.inputBorder,
                    },
                  ]}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: 'Inter-500',
                      color: selected ? colors.onPrimary : colors.title,
                    }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {datePreset !== 'none' && (
              <TouchableOpacity onPress={clearDateRange} style={styles.dateChip}>
                <MaterialIcons name="close" size={14} color={colors.expense} />
              </TouchableOpacity>
            )}
          </View>
          {datePreset === 'custom' && (
            <>
              <Spacer height={12} />
              <DatePickerWithOutValue
                label="From:"
                value={draft.customDateRange?.start}
                onChange={(v) =>
                  setDraft((prev) => ({
                    ...prev,
                    customDateRange: { start: v, end: prev.customDateRange?.end || v },
                  }))
                }
                placeholder="Start date"
              />
              <Spacer height={10} />
              <DatePickerWithOutValue
                label="To:"
                value={draft.customDateRange?.end}
                onChange={(v) =>
                  setDraft((prev) => ({
                    ...prev,
                    customDateRange: { start: prev.customDateRange?.start || v, end: v },
                  }))
                }
                placeholder="End date"
                minimumDate={draft.customDateRange?.start}
              />
            </>
          )}
        </View>
        <Spacer height={20} />

        <View style={{ paddingHorizontal: 5, flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Input
              value={draft.minAmount}
              onChangeText={(v) =>
                setDraft((prev) => ({ ...prev, minAmount: sanitizeAmount(v) }))
              }
              placeholder="Min"
              label="Min Amount"
              keyboardType="numeric"
              borderLess
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              value={draft.maxAmount}
              onChangeText={(v) =>
                setDraft((prev) => ({ ...prev, maxAmount: sanitizeAmount(v) }))
              }
              placeholder="Max"
              label="Max Amount"
              keyboardType="numeric"
              borderLess
            />
          </View>
        </View>
        <Spacer height={20} />

        {(draft.transactionType === 'income' || draft.transactionType === 'expense') && (
          <>
            <View style={{ paddingHorizontal: 5 }}>
              <Text style={[styles.label, { color: colors.title }]}>Categories</Text>
              <CategorySelector
                categories={categories.filter(
                  (category) =>
                    category.exp_tc_transaction_type ===
                    (draft.transactionType === 'income' ? 2 : 1),
                )}
                selected={draft.categoryIds}
                onSelect={toggleCategory}
                multiple
              />
            </View>
            <Spacer height={30} />
          </>
        )}

        <View>
          <TouchableOpacity onPress={handlePress}>
            <LinearGradient
              colors={colors.floatingBtnBg as [ColorValue, ColorValue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.button]}>
              <Text style={[styles.btntitle, { color: colors.onPrimary }]}>Apply</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ModalCard>
    </>
  );
};

export default TransactionFilters;

const styles = StyleSheet.create({
  trigger: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 9,
    width: 'auto',
  },
  loader: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btntitle: {
    fontSize: 16,
    fontFamily: 'Inter-600',
  },
  disable: {
    opacity: 0.4,
  },
  textDisable: { opacity: 0 },
  iconBox: {
    alignItems: 'center',
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontFamily: 'Inter-400',
  },
  card: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 10,
    flexWrap: 'wrap',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 50,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
