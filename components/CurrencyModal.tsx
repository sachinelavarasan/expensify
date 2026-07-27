import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Spacer from './Spacer';
import Modal from 'react-native-modal';
import { deviceHeight, deviceWidth, getAsyncValue, loadCurrencySettings, setAsyncValue } from '@/utils/functions';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

const width = deviceWidth();
const height = deviceHeight();

const visibleOption = [
  { id: '1', label: 'Show' },
  { id: '0', label: "Don't Show" },
];

const schema = z.object({
  currency: z.string(),
});

type CurrencySchema = z.infer<typeof schema>;

const CurrencyModal = ({
  currency,
  refetch,
  updateSettings,
}: {
  currency?: string;
  refetch: () => Promise<QueryObserverResult<IExpUser, Error>>;
  updateSettings: (name: string, value: boolean | string) => void;
}) => {
  const { colors, theme } = useThemeContext();
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
      .catch(() => {
        showToast({
          text1: 'Server Error',
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
      <TouchableOpacity style={styles.card} onPress={toggleModal}>
        <View style={styles.left}>
          <FontAwesome name="money" size={20} color={colors.title} />
          <View>
            <Text style={[styles.option, { color: colors.title }]}>Currency</Text>
            <Text style={[styles.subText, { color: colors.description }]}>
              {currency || 'Set your preferred currency symbol'}
            </Text>
          </View>
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
              <Text style={[styles.title, { color: colors.title }]}>Select Currency</Text>

              <TouchableOpacity
                onPress={toggleModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" color={'#5a4f96'} size={20} />
              </TouchableOpacity>
            </View>
            <Spacer height={15} />
            {/* <Controller
              control={control}
              render={({ field }) => (
                <CustomRadioButton isColumn={false} options={currencyOptions} {...field} />
              )}
              name="currency"
            /> */}
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
                    backgroundColor: watchCurrency === item.id ? '#6B5DE6' : 'transparent',
                    borderRadius: 20,
                    width: 100,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={[
                      styles.subText,
                      {
                        color: watchCurrency === item.id ? '#FFF' : colors.description,
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
                style={[styles.button, isPending ? styles.disable : {}]}
                onPress={handleSubmit(settingChange)}
                disabled={ isPending}>
                {isPending ? (
                  <ActivityIndicator animating color={'#FFF'} style={styles.loader} />
                ) : null}
                <Text style={[styles.btntitle, isPending ? styles.textDisable : {}]}>Submit</Text>
              </TouchableOpacity>
            </View>
            <Spacer height={20} />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default CurrencyModal;

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
    flex: 1,
    maxWidth: deviceWidth() * 0.65,
  },
  option: {
    fontSize: 14,
    fontFamily: 'Inter-600',
  },
  subText: {
    fontSize: 12,
    color: '#ccc',
    fontFamily: 'Inter-500',
    marginTop: 2,
  },
});
