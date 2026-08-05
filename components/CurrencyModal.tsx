import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Spacer from './Spacer';
import SettingsRow from './SettingsRow';
import ModalCard from './ModalCard';
import { getAsyncValue, loadCurrencySettings, setAsyncValue } from '@/utils/functions';
import { FontAwesome } from '@expo/vector-icons';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { currencyOptions } from '@/utils/common-data';
import { showToast } from './ToastMessage';
import CustomRadioButton from './CustomRadioButton';
import { IExpUser } from '@/types';
import { useUserSettingChanges } from '@/hooks/useSettings';
import { QueryObserverResult } from '@tanstack/react-query';
import { useThemeContext } from '@/contexts/ThemedContext';
import { getApiErrorMessage } from '@/lib/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const visibleOption = [
  { id: '1', label: 'Show' },
  { id: '0', label: "Don't Show" },
];

const TINT = '#10B981';

const schema = z.object({
  currency: z.string(),
});

type CurrencySchema = z.infer<typeof schema>;

const CurrencyModal = ({
  currency,
  refetch,
  updateSettings,
  noCard,
  topDivider,
}: {
  currency?: string;
  refetch: () => Promise<QueryObserverResult<IExpUser, Error>>;
  updateSettings: (name: string, value: boolean | string) => void;
  noCard?: boolean;
  topDivider?: boolean;
}) => {
  const { colors } = useThemeContext();
  const [show, setShow] = useState(false);
  const [currencyVisible, setCurrencyVisible] = useState<string | number>('');
  const { mutateAsync: settingChanges, isPending } = useUserSettingChanges();

  const {
    handleSubmit,
    formState,
    setValue,
    reset,
    watch
  } = useForm({
    defaultValues: {
      currency: '',
    },
    resolver: zodResolver(schema),
  });
  const watchCurrency = watch('currency');

  useEffect(() => {
    const getValuesFromStore = async () => {
      const showTransaction = await AsyncStorage.getItem('show_currency');
       if(showTransaction){
        setCurrencyVisible(JSON.parse(showTransaction));
      }
    };
    getValuesFromStore();
  }, [currency]);

  useEffect(() => {
    if (currency) {
      reset(
        {
          currency,
        },
        {
          keepDirty: false,
          keepIsValidating: true,
        },
      );
    }
  }, [currency, reset]);

  const toggleModal = () => {
    setShow(!show);
    reset();
  };

  const settingChange = (datas: CurrencySchema) => {
    if (datas.currency.trim().length === 0) {
      return;
    }
    const data: Partial<IExpUser> = {
      exp_us_currency: datas.currency,
    };
    settingChanges(data)
      .then(() => {
        showToast({
          text1: 'Currency has been updated',
          type: 'success',
          position: 'bottom',
        });
        refetch();
        updateSettings('currency', datas.currency);
        AsyncStorage.setItem('show_currency', JSON.stringify(currencyVisible));
      })
      .catch((err) => {
        showToast({
          text1: getApiErrorMessage(err, 'Server Error'),
          type: 'error',
          position: 'bottom',
        });
      })
      .finally(async () => {
        toggleModal();
        await loadCurrencySettings();
      });
  };

  const onChange = (id: string | number) => {
    setCurrencyVisible(id);
  };

  return (
    <>
      <SettingsRow
        icon={<FontAwesome name="money" size={16} color={TINT} />}
        iconBg={`${TINT}1A`}
        title="Currency"
        subtitle={currency || 'Set your preferred currency symbol'}
        onPress={toggleModal}
        noCard={noCard}
        topDivider={topDivider}
      />

      <ModalCard visible={show} onClose={toggleModal} title="Select Currency" closeDisabled={isPending}>
        <View
          style={{
            flexDirection: 'row',
            gap: 20,
            flexWrap: 'wrap',
            paddingHorizontal: 10,
          }}>
          {currencyOptions.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                setValue('currency', item.id, {
                  shouldDirty: true,
                });
              }}
              style={{
                padding: 6,
                backgroundColor: watchCurrency === item.id ? colors.primary : 'transparent',
                borderRadius: 20,
                width: 100,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={[
                  styles.subText,
                  {
                    color: watchCurrency === item.id ? colors.onPrimary : colors.description,
                    fontSize: 14,
                  },
                ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
          <Spacer height={10} />
          <CustomRadioButton
            isColumn={false}
            options={visibleOption}
            value={currencyVisible}
            onChange={onChange}
          />
        </View>

        <Spacer height={20} />

        <View>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              isPending ? styles.disable : {},
            ]}
            onPress={handleSubmit(settingChange)}
            disabled={isPending}>
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

export default CurrencyModal;

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
  subText: {
    fontSize: 12,
    fontFamily: 'Inter-500',
    marginTop: 2,
  },
});
