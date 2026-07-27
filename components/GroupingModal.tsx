import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Spacer from './Spacer';
import ModalCard from './ModalCard';
import { Entypo } from '@expo/vector-icons';
import { dataGroupingType } from '@/utils/common-data';
import CustomRadioButton from './CustomRadioButton';
import { useThemeContext } from '@/contexts/ThemedContext';

const GroupingModal = ({
  grouping,
  update,
}: {
  grouping: 'daily' | 'weekly' | 'monthly';
  update: (date: 'daily' | 'weekly' | 'monthly') => void;
}) => {
  const { colors } = useThemeContext();
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
      <TouchableOpacity style={[styles.card, { backgroundColor: colors.primary }]} onPress={toggleModal}>
        <View style={styles.chip}>
          <Text style={[styles.subText, { color: colors.onPrimary }]}>{grouping}</Text>
          <Entypo name="chevron-small-down" size={20} color={colors.onPrimary} />
        </View>
      </TouchableOpacity>

      <ModalCard visible={show} onClose={toggleModal} title="Default Grouping">
        <CustomRadioButton
          isColumn
          options={dataGroupingType}
          value={selection}
          onChange={(vale) => setSelection(vale as 'daily' | 'weekly' | 'monthly')}
        />

        <Spacer height={20} />
        <View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={settingChange}>
            <Text style={[styles.btntitle, { color: colors.onPrimary }]}>Apply</Text>
          </TouchableOpacity>
        </View>
      </ModalCard>
    </>
  );
};

export default GroupingModal;

const styles = StyleSheet.create({
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
  card: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 50,
    flexShrink: 1,
  },
  chip: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  subText: {
    fontSize: 14,
    fontFamily: 'Inter-600',
    textTransform: 'capitalize',
  },
});
