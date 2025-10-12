import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import Spacer from './Spacer';
import Modal from 'react-native-modal';
import { deviceHeight, deviceWidth } from '@/utils/functions';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { transactionExportType } from '@/utils/common-data';
import SearchBar from './SearchBar';
import CustomRadioButton from './CustomRadioButton';
import { useThemeContext } from '@/contexts/ThemedContext';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomSelectInput } from './CustomSelectInput';
import { BankAccount } from '@/types';

const width = deviceWidth();
const height = deviceHeight();

const TransactionFilters = ({
  selectedTransaction,
  searchText,
  selectedAccount,
  applyFilters,
  accounts,
}: {
  selectedTransaction: string;
  searchText: string;
  applyFilters: (search: string, transactionType: string, bankAccount: number | string) => void;
  accounts: BankAccount[];
  selectedAccount: number | string
}) => {
  const { colors, theme } = useThemeContext();
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState(searchText);
  const [transactionType, setTransactionType] = useState<string>(selectedTransaction);
  const [bankAccount, setBankAccount] = useState<number | string>(selectedAccount);

  const toggleModal = () => {
    setShow(!show);
  };

  const handlePress = () => {
    if (search.trim().length === 0 && transactionType.length === 0 && !bankAccount) {
      return;
    }
    applyFilters(search, transactionType, bankAccount);
    toggleModal();
  };

  return (
    <>
      <TouchableOpacity
        onPress={toggleModal}
        style={{
          width: 'auto',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 5,
          paddingHorizontal: 5,
        }}>
        <FontAwesome6 name="filter" size={20} color="#FFF" />
      </TouchableOpacity>

      <Modal
        backdropColor={theme === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(28, 27, 27, 0.5)'}
        style={{ flex: 1 }}
        isVisible={show}
        hasBackdrop={true}
        deviceHeight={height}
        deviceWidth={width}
        animationIn={'fadeIn'}
        animationOut={'fadeOut'}
        coverScreen={true}>
        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View style={[styles.modal, { backgroundColor: colors.background }]}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text style={[styles.title, { color: colors.title }]}>Apply Filters</Text>

              <TouchableOpacity onPress={toggleModal}>
                <Ionicons name="close" color={'#5a4f96'} size={20} />
              </TouchableOpacity>
            </View>
            <Spacer height={20} />
            <SearchBar
              searchPhrase={search}
              onChange={(e: any) => {
                setSearch(e);
              }}
            />
            <Spacer height={20} />

            <View style={styles.card}>
              <CustomRadioButton
                label="Transaction Type"
                value={transactionType}
                options={transactionExportType}
                onChange={(data) => {
                  setTransactionType(data as 'income' | 'expense' | 'all');
                }}
              />
            </View>
            <Spacer height={15} />
            <View style={{ paddingHorizontal: 5 }}>
              <CustomSelectInput
                value={selectedAccount}
                options={accounts.map((account) => ({
                  key: account.exp_ba_id,
                  value: account.exp_ba_name,
                }))}
                label="Bank Account"
                onChange={(selectId)=> setBankAccount(selectId)}
              />
            </View>
            <Spacer height={30} />
            <View>
              <TouchableOpacity onPress={handlePress}>
                <LinearGradient
                  colors={['#6B5DE6', '#6900FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.button]}>
                  <Text style={[styles.btntitle]}>Apply</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <Spacer height={20} />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default TransactionFilters;

const styles = StyleSheet.create({
  modal: {
    width: deviceWidth() - 60,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    color: '#1E1E1E',
    fontFamily: 'Inter-600',
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#6B5DE6',
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
    color: '#FFFFFF',
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
    color: '#282343',
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
