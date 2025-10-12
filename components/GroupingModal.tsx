import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Spacer from './Spacer';
import Modal from 'react-native-modal';
import { deviceHeight, deviceWidth } from '@/utils/functions';
import { Entypo, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { dataGroupingType } from '@/utils/common-data';
import CustomRadioButton from './CustomRadioButton';
import { useThemeContext } from '@/contexts/ThemedContext';

const width = deviceWidth();
const height = deviceHeight();

const GroupingModal = ({
  grouping,
  update,
}: {
  grouping: 'daily' | 'weekly' | 'monthly';
  update: (date: 'daily' | 'weekly' | 'monthly') => void;
}) => {
  const { colors, theme } = useThemeContext();
  const [show, setShow] = useState(false);
  const [selection, setSelection] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    if (grouping) {
      setSelection(grouping);
    }
  }, [grouping]);

  const toggleModal = () => {
    setShow(!show);
  };

  const settingChange = () => {
    update(selection);
    toggleModal();
  };

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={toggleModal}>
        <View style={styles.chip}>
          <Text style={[styles.subText, { color:  "#ffffff" }]}>
            {grouping} 
          </Text>
          <Entypo name="chevron-small-down" size={24} color="#fff" />
        </View>
      </TouchableOpacity>

      <Modal
        backdropColor={theme === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(28, 27, 27, 0.5)'}
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
              <Text style={[styles.title, { color: colors.title }]}>Default Grouping</Text>

              <TouchableOpacity
                onPress={toggleModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" color={"#5a4f96"} size={20} />
              </TouchableOpacity>
            </View>
            <Spacer height={15} />

            <CustomRadioButton
              isColumn
              options={dataGroupingType}
              value={selection}
              onChange={(vale) => setSelection(vale as 'daily' | 'weekly' | 'monthly')}
            />

            <Spacer height={20} />
            <View>
              <TouchableOpacity style={[styles.button]} onPress={settingChange}>
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

export default GroupingModal;

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#16161A',
    width: deviceWidth() - 60,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 20,
    color: '#FFFFFF',
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
  card: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 50,
    backgroundColor: '#6B5DE6'
  },
  amount: {
    color: '#A0A0A0',
    fontSize: 14,
    fontFamily: 'Inter-500',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center',
    gap: 3,
  },
  option: {
    color: '#F1F1F6',
    fontSize: 14,
    fontFamily: 'Inter-600',
  },
  subText: {
    fontSize: 14,
    fontFamily: 'Inter-600',
    textTransform: 'capitalize'
  },
});
