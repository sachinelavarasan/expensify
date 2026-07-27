import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Spacer from './Spacer';
import Modal from 'react-native-modal';
import { deviceHeight, deviceWidth } from '@/utils/functions';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { dataGroupingType } from '@/utils/common-data';
import CustomRadioButton from './CustomRadioButton';
import { useUserSettingChanges } from '@/hooks/useSettings';
import { showToast } from './ToastMessage';
import { IExpUser } from '@/types';
import { QueryObserverResult } from '@tanstack/react-query';
import { useThemeContext } from '@/contexts/ThemedContext';

const width = deviceWidth();
const height = deviceHeight();

const schema = z.object({
  grouping: z.string(),
});

type DefaultTGrouping = z.infer<typeof schema>;

const DefaultGroupingModal = ({
  grouping,
  refetch,
  updateSettings
}: {
  grouping?: string;
  refetch: () => Promise<QueryObserverResult<IExpUser, Error>>;
  updateSettings: (name: string, value: boolean | string)=> void;
}) => {
  const { colors } = useThemeContext();
  const [show, setShow] = useState(false);
  const { mutateAsync: settingChanges, isPending } = useUserSettingChanges();

  const {
    control,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm({
    defaultValues: {
      grouping: '',
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (grouping) {
      reset(
        {
          grouping,
        },
        {
          keepDirty: false,
          keepIsValidating: true,
        },
      );
    }
  }, [grouping, reset]);

  const toggleModal = () => {
    setShow(!show);
    reset();
  };

  const settingChange = (datas: DefaultTGrouping) => {
    if (datas.grouping.trim().length === 0) {
      return;
    }

    const data: Partial<IExpUser> = {
      exp_us_default_grouping: datas.grouping,
    };

    settingChanges(data)
      .then(() => {
        showToast({
          text1: 'Transaction grouping has been updated',
          type: 'success',
          position: 'bottom',
        });
        updateSettings('grouping', datas.grouping)
      })
      .catch(() => {
        showToast({
          text1: 'Server Error',
          type: 'error',
          position: 'bottom',
        });
      })
      .finally(() => {
        toggleModal();
        refetch();
      });
  };

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={toggleModal}>
        <View style={styles.left}>
          <FontAwesome5 name="layer-group" size={20} color={colors.text} />
          <View>
            <Text style={[styles.option, { color: colors.title }]}>Default Grouping</Text>
            <Text style={[styles.subText, { color: colors.description }]}>
              {grouping || 'Group transactions by month, week, day'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        backdropColor={colors.scrim}
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
                <Ionicons name="close" color={colors.arrowColor} size={20} />
              </TouchableOpacity>
            </View>
            <Spacer height={15} />
            <Controller
              control={control}
              render={({ field }) => (
                <CustomRadioButton isColumn options={dataGroupingType} {...field} />
              )}
              name="grouping"
            />

            <Spacer height={20} />
            <View>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colors.primary },
                  !isDirty || isPending ? styles.disable : {},
                ]}
                onPress={handleSubmit(settingChange)}
                disabled={!isDirty || isPending}>
                {isPending ? (
                  <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
                ) : null}
                <Text
                  style={[
                    styles.btntitle,
                    { color: colors.onPrimary },
                    isPending ? styles.textDisable : {},
                  ]}>
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
            <Spacer height={20} />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DefaultGroupingModal;

const styles = StyleSheet.create({
  modal: {
    width: deviceWidth() - 60,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-600',
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
  card: {
    paddingVertical: 8,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  option: {
    fontSize: 14,
    fontFamily: 'Inter-600',
  },
   subText: {
    fontSize: 12,
    fontFamily: 'Inter-500',
    marginTop: 2,
  },
});
