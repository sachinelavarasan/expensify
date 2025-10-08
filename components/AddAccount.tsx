import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Spacer from './Spacer';
import Modal from 'react-native-modal';
import { deviceHeight, deviceWidth } from '@/utils/functions';
import { FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import Input from './Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { accountIcon } from '@/utils/common-data';
import { showToast } from './ToastMessage';
import { LinearGradient } from 'expo-linear-gradient';
import { useAddBankAccount, useUpdateBankAccount } from '@/hooks/useBankAccountOperation';
import { useThemeContext } from '@/contexts/ThemedContext';

const width = deviceWidth();
const height = deviceHeight();

const schema = z.object({
  exp_ba_name: z.string().trim().min(3, { message: 'Name should be minimum 3 characters' }),
  exp_ba_balance: z
    .string()
    .refine((val) => !val || /^(\d+)(\.\d{1,3})?$/.test(val), {
      message: 'Please enter a valid amount',
    })
    .optional(),
  exp_ba_icon: z.string().optional(),
});

type BankAccount = z.infer<typeof schema>;

const AddAccount = ({ account, exp_ba_id }: { account?: BankAccount; exp_ba_id?: number }) => {
  const { colors, theme } = useThemeContext();
  const [show, setShow] = useState(false);
  const { mutateAsync: addBankAccount, isPending: isLoading } = useAddBankAccount();
  const { mutateAsync: updateBankAccount, isPending: isUpdating } = useUpdateBankAccount();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      exp_ba_name: '',
      exp_ba_balance: '0',
      exp_ba_icon: 'attach-money',
    },
    resolver: zodResolver(schema),
  });

  const selectedIcon = watch('exp_ba_icon');

  useEffect(() => {
    if (account) {
      reset(
        {
          ...account,
        },
        {
          keepDirty: false,
          keepIsValidating: true,
        },
      );
    }
  }, [account, reset]);

  const toggleModal = () => {
    setShow(!show);
    reset();
  };

  const handlePress = (data: BankAccount) => {
    if (data.exp_ba_name.trim().length === 0) {
      return;
    }
    if (exp_ba_id) {
      const body = {
        ...data,
        exp_ba_balance: data.exp_ba_balance || '0',
        exp_ba_icon: data.exp_ba_icon || 'attach-money',
        exp_ba_id,
      };
      updateBankAccount({ ...body })
        .then(() => {
          showToast({
            text1: 'Account updated successfully',
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
        });
    } else {
      const body = {
        ...data,
        exp_ba_balance: data.exp_ba_balance || '0',
        exp_ba_icon: data.exp_ba_icon || 'attach-money',
      };
      addBankAccount({ ...body })
        .then(() => {
          showToast({
            text1: 'New Account added successfully',
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
        });
    }
  };
  return (
    <>
      <Pressable onPress={toggleModal} style={{ borderRadius: 40, overflow: 'hidden' }}>
        {exp_ba_id ? (
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="circle-edit-outline" size={28} color={'#fff'} />
          </View>
        ) : (
          <LinearGradient
            colors={['#6C63FF', '#B388FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.addbutton]}>
            <Text style={styles.text}>Add New</Text>
          </LinearGradient>
        )}
      </Pressable>

      <Modal
        backdropColor={theme === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
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
              <Text style={[styles.title, { color: colors.title }]}>
                {exp_ba_id ? 'Edit Account' : 'Add Account'}
              </Text>

              <TouchableOpacity onPress={toggleModal}>
                <Ionicons name="close" color="#5a4f96" size={20} />
              </TouchableOpacity>
            </View>
            <Spacer height={15} />
            <Controller
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Account Name"
                  keyboardType="default"
                  autoCapitalize="none"
                  autoComplete="off"
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  error={errors.exp_ba_name?.message}
                  borderLess
                />
              )}
              name="exp_ba_name"
            />
            <Spacer height={20} />
            <Controller
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Initial Amount"
                  keyboardType="numeric"
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  error={errors.exp_ba_balance?.message}
                  borderLess
                  editable={!exp_ba_id}
                  isRequired
                />
              )}
              name="exp_ba_balance"
            />
            <Spacer height={20} />
            <Text style={[styles.label, { color: colors.title }]}>Select Icon</Text>
            <View
              style={{
                borderColor: colors.borderColor,
                borderWidth: 1,
                borderRadius: 8,
                paddingVertical: 5,
                paddingHorizontal: 8,
              }}>
              <FlatList
                showsVerticalScrollIndicator={false}
                horizontal
                data={accountIcon}
                contentContainerStyle={{
                  gap: 5,
                }}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  return (
                    <View style={{ padding: 5 }}>
                      <Pressable
                        key={item}
                        style={[styles.iconBox]}
                        onPress={() => {
                          setValue('exp_ba_icon', item, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}>
                        <View
                          style={{
                            backgroundColor: selectedIcon === item ? '#6B5DE6' : '#EBE9FC',
                            padding: 5,
                            borderRadius: 5,
                          }}>
                          <MaterialIcons
                            name={item as React.ComponentProps<typeof MaterialIcons>['name']}
                            size={24}
                            color={selectedIcon === item ? '#FFFFFF' : '#5A5A6E'}
                          />
                        </View>
                      </Pressable>
                    </View>
                  );
                }}
              />
            </View>
            <Spacer height={20} />
            <View>
              <TouchableOpacity
                style={[styles.button, !isDirty || isLoading || isUpdating ? styles.disable : {}]}
                onPress={handleSubmit(handlePress)}
                disabled={!isDirty || isLoading || isUpdating}>
                {isLoading || isUpdating ? (
                  <ActivityIndicator animating color={'#FFFFFF'} style={styles.loader} />
                ) : null}
                <Text style={[styles.btntitle, isLoading || isUpdating ? styles.textDisable : {}]}>
                  {exp_ba_id ? 'Update' : 'Create'}
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

export default AddAccount;

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
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-600',
  },
  disable: {
    opacity: 0.6,
  },
  textDisable: { opacity: 0 },
  iconBox: {
    alignItems: 'center',
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontFamily: 'Inter-400',
  },
  addbutton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B388FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Inter-600',
  },
});
