import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Spacer from './Spacer';
import ModalCard from './ModalCard';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { dataGroupingType } from '@/utils/common-data';
import CustomRadioButton from './CustomRadioButton';
import { useThemeContext } from '@/contexts/ThemedContext';

const GroupingModal = ({
  grouping,
  update,
  // Swaps the trigger's neutral barBackground/borderColor chip for a
  // colors.primary tint, to sit visually alongside other primary-tinted
  // icon triggers (e.g. dashboard/index.tsx's calendar toggle) - opt-in so
  // the settings and stats screens keep their current neutral chip.
  tint = false,
}: {
  grouping: 'daily' | 'weekly' | 'monthly';
  update: (date: 'daily' | 'weekly' | 'monthly') => void;
  tint?: boolean;
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
      {tint ? (
        <TouchableOpacity
          onPress={toggleModal}
          style={[styles.iconTrigger, { backgroundColor: `${colors.primary}1A` }]}>
          <Ionicons name="layers-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: colors.barBackground, borderColor: colors.borderColor },
          ]}
          onPress={toggleModal}>
          <View style={styles.chip}>
            <Text style={[styles.subText, { color: colors.title }]}>{grouping}</Text>
            <Entypo name="chevron-small-down" size={20} color={colors.lighterTitle} />
          </View>
        </TouchableOpacity>
      )}

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
    borderWidth: 1,
    flexShrink: 1,
  },
  iconTrigger: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
