import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import Spacer from './Spacer';
import Modal from 'react-native-modal';
import { deviceHeight, deviceWidth } from '@/utils/functions';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { transactionExportType } from '@/utils/common-data';
import SearchBar from './SearchBar';
import CustomRadioButton from './CustomRadioButton';

const width = deviceWidth();
const height = deviceHeight();

const TransactionFilters = ({
  selectedTransaction,
  searchText,
  applyFilters,
}: {
  selectedTransaction: string,
  searchText: string,
  applyFilters: (search: string, transactionType: string) => void;
}) => {
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState(searchText);
  const [transactionType, setTransactionType] = useState<string>(selectedTransaction);

  const toggleModal = () => {
    setShow(!show);
  };

  const handlePress = () => {
    if (search.trim().length === 0 && transactionType.length === 0) {
      return;
    }
    applyFilters(search, transactionType);
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
          paddingHorizontal: 10,
        }}>
        <FontAwesome6 name="filter" size={20} color="#5a4f96" />
      </TouchableOpacity>

      <Modal
        backdropColor="rgba(0, 0, 0, 0.5)"
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
          <View style={styles.modal}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text style={styles.title}>Apply Filters</Text>

              <TouchableOpacity onPress={toggleModal}>
                <Ionicons name="close" color="#fff" size={20} />
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
            <Spacer height={30} />
            <View>
              <TouchableOpacity style={[styles.button]} onPress={handlePress}>
                <Text style={[styles.btntitle]}>Apply</Text>
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
    backgroundColor: '#16161A',
    width: deviceWidth() - 60,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-600',
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#463e75',
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
    color: '#FFF',
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
    color: '#B3B1C4',
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
