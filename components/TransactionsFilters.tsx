import { ColorValue, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import Spacer from './Spacer';
import ModalCard from './ModalCard';
import { FontAwesome6 } from '@expo/vector-icons';
import { transactionExportType } from '@/utils/common-data';
import SearchBar from './SearchBar';
import CustomRadioButton from './CustomRadioButton';
import { useThemeContext } from '@/contexts/ThemedContext';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomSelectInput } from './CustomSelectInput';
import { BankAccount } from '@/types';

const TransactionFilters = ({
  selectedTransaction,
  searchText,
  selectedAccount,
  applyFilters,
  accounts,
  hasActiveFilters = false,
}: {
  selectedTransaction: string;
  searchText: string;
  applyFilters: (search: string, transactionType: string, bankAccount: number | string) => void;
  accounts: BankAccount[];
  selectedAccount: number | string;
  hasActiveFilters?: boolean;
}) => {
  const { colors } = useThemeContext();
  const [show, setShow] = useState(false);
  const primaryAccountId = accounts.find((account) => account.exp_ba_is_primary)?.exp_ba_id;

  const draftFromProps = () => ({
    search: searchText,
    transactionType: selectedTransaction,
    bankAccount: selectedAccount || primaryAccountId || '',
  });
  const [draft, setDraft] = useState(draftFromProps);

  const openModal = () => {
    setDraft(draftFromProps());
    setShow(true);
  };
  const closeModal = () => setShow(false);

  const handlePress = () => {
    if (!draft.search.trim() && !draft.transactionType && !draft.bankAccount) {
      return;
    }
    applyFilters(draft.search, draft.transactionType, draft.bankAccount);
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
              setDraft((prev) => ({ ...prev, transactionType: data as string }));
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
        <Spacer height={30} />
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
});
