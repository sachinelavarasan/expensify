import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Spacer from './Spacer';
import Modal from 'react-native-modal';
import { deviceHeight, deviceWidth } from '@/utils/functions';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { currencyOptions } from '@/utils/common-data';
import { showToast } from './ToastMessage';
import CustomRadioButton from './CustomRadioButton';
import { IExpUser } from '@/types';
import { useUserSettingChanges } from '@/hooks/useSettings';
import { QueryObserverResult } from '@tanstack/react-query';

const width = deviceWidth();
const height = deviceHeight();

const schema = z.object({
  currency: z.string(),
});

type CurrencySchema = z.infer<typeof schema>;

const CurrencyModal = ({ currency, refetch }: { currency?: string, refetch: ()=>Promise<QueryObserverResult<IExpUser, Error>> }) => {
  const [show, setShow] = useState(false);
  const { mutateAsync: settingChanges, isPending } = useUserSettingChanges();

  const {
    control,
    handleSubmit,
    formState: {  isDirty },
    reset,
  } = useForm({
    defaultValues: {
      currency: '',
    },
    resolver: zodResolver(schema),
  });

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
        refetch()
      });
  };

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={toggleModal}>
        <View style={styles.left}>
          <FontAwesome name="money" size={20} color="white" />
          <View>
            <Text style={styles.option}>Currency</Text>
            <Text style={styles.subText}>{currency || 'Set your preferred currency symbol'}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        backdropColor="rgba(0, 0, 0, 0.5)"
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
              <Text style={styles.title}>Currency</Text>

              <TouchableOpacity
                onPress={toggleModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" color="#fff" size={20} />
              </TouchableOpacity>
            </View>
            <Spacer height={15} />
            <Controller
              control={control}
              render={({ field }) => (
                <CustomRadioButton isColumn={true} options={currencyOptions} {...field} />
              )}
              name="currency"
            />
            <Spacer height={20} />

            <View>
              <TouchableOpacity
                style={[styles.button, !isDirty || isPending ? styles.disable : {}]}
                onPress={handleSubmit(settingChange)}
                disabled={!isDirty || isPending}>
                {isPending ? (
                  <ActivityIndicator animating color={'#FFF'} style={styles.loader} />
                ) : null}
                <Text style={[styles.btntitle, isPending ? styles.textDisable : {}]}>
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

export default CurrencyModal;

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
    paddingVertical: 8,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
  },
  amount: {
    color: '#A0A0A0',
    fontSize: 14,
    fontFamily: 'Inter-500',
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
    color: '#F1F1F6',
    fontSize: 14,
    fontFamily: 'Inter-600',
  },
  subText: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 2,
  },
});
