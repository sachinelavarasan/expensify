import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Spacer from './Spacer';
import SettingsRow from './SettingsRow';
import ModalCard from './ModalCard';
import { FontAwesome5 } from '@expo/vector-icons';
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
      <SettingsRow
        icon={<FontAwesome5 name="layer-group" size={16} color={colors.onPrimary} />}
        title="Default Grouping"
        subtitle={grouping || 'Group transactions by month, week, day'}
        onPress={toggleModal}
      />

      <ModalCard
        visible={show}
        onClose={toggleModal}
        title="Default Grouping"
        closeDisabled={isPending}>
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
      </ModalCard>
    </>
  );
};

export default DefaultGroupingModal;

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
});
