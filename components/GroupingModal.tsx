import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Spacer from './Spacer';
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
  triggerWidth,
}: {
  grouping: 'daily' | 'weekly' | 'monthly';
  update: (date: 'daily' | 'weekly' | 'monthly') => void;
  tint?: boolean;
  triggerWidth?: number;
}) => {
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [selection, setSelection] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    if (grouping) {
      setSelection(grouping);
    }
  }, [grouping]);

  const openSheet = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const closeSheet = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const settingChange = () => {
    update(selection);
    closeSheet();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        style={{ backgroundColor: colors.scrim }}
      />
    ),
    [colors],
  );

  return (
    <>
      {tint ? (
        <TouchableOpacity
          onPress={openSheet}
          style={[styles.iconTrigger, { backgroundColor: `${colors.primary}1A` }]}>
          <Ionicons name="layers-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: colors.barBackground, borderColor: colors.borderColor },
            triggerWidth != null && { width: triggerWidth },
          ]}
          onPress={openSheet}>
          <View style={styles.chip}>
            <Ionicons name="layers-outline" size={13} color={colors.lighterTitle} />
            <Text style={[styles.subText, { color: colors.title }]}>
              {grouping.slice(0, 2).toUpperCase()}
            </Text>
            <Entypo name="chevron-small-down" size={16} color={colors.lighterTitle} />
          </View>
        </TouchableOpacity>
      )}

      <BottomSheetModal
        ref={bottomSheetModalRef}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.cardBg }}
        handleIndicatorStyle={{ backgroundColor: colors.borderColor }}>
        <BottomSheetView style={[styles.sheetContent, { paddingBottom: 22 + insets.bottom }]}>
          <Text style={[styles.sheetTitle, { color: colors.title }]}>Default Grouping</Text>

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
        </BottomSheetView>
      </BottomSheetModal>
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
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    paddingVertical: 6,
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
    width: '100%',
    gap: 2,
  },
  subText: {
    fontSize: 14,
    fontFamily: 'Inter-600',
    textTransform: 'capitalize',
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingTop: 4,
  },
  sheetTitle: {
    fontSize: 16,
    fontFamily: 'Inter-600',
    marginBottom: 16,
  },
});
