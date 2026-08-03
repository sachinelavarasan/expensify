import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Spacer from './Spacer';
import SettingsRow from './SettingsRow';
import ModalCard from './ModalCard';
import { FontAwesome } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CoreTransactionType } from '@/utils/common-data';
import CustomRadioButton from './CustomRadioButton';
import { IExpUser } from '@/types';
import { showToast } from './ToastMessage';
import { useUserSettingChanges } from '@/hooks/useSettings';
import { QueryObserverResult } from '@tanstack/react-query';
import { useThemeContext } from '@/contexts/ThemedContext';
import { getApiErrorMessage } from '@/lib/apiClient';

const schema = z.object({
  transaction_type: z.number(),
});

type DefaultTT = z.infer<typeof schema>;

const DefaultTransactionModal = ({
  transaction_type,
  label,
  refetch,
  updateSettings
}: {
  transaction_type?: number;
  label?: string;
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
      transaction_type: 1,
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (transaction_type) {
      reset(
        {
          transaction_type: transaction_type,
        },
        {
          keepDirty: false,
          keepIsValidating: true,
        },
      );
    }
  }, [transaction_type, reset]);

  const toggleModal = () => {
    setShow(!show);
    reset();
  };

  const settingChange = (datas: DefaultTT) => {
    const data: Partial<IExpUser> = {
      exp_us_default_transaction: datas.transaction_type,
    };

    settingChanges(data)
      .then(() => {
        showToast({
          text1: 'Transaction type has been updated',
          type: 'success',
          position: 'bottom',
        });
        refetch();
        updateSettings('d_transaction', String(datas.transaction_type))
      })
      .catch((err) => {
        showToast({
          text1: getApiErrorMessage(err, 'Server Error'),
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
        icon={<FontAwesome name="exchange" size={16} color={colors.onPrimary} />}
        title="Default Transaction"
        subtitle={label || 'Choose default type: Income or Expense'}
        onPress={toggleModal}
      />

      <ModalCard
        visible={show}
        onClose={toggleModal}
        title="Default Transaction"
        closeDisabled={isPending}>
        <Controller
          control={control}
          render={({ field }) => (
            <CustomRadioButton isColumn options={CoreTransactionType} {...field} />
          )}
          name="transaction_type"
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

export default DefaultTransactionModal;

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
