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
import ModalCard from './ModalCard';
import { FontAwesome, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import Input from './Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { accountIcon } from '@/utils/common-data';
import { showToast } from './ToastMessage';
import { AddAccountButtonGradient } from '@/utils/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useAddBankAccount,
  useSetPrimaryBankAccount,
  useUpdateBankAccount,
} from '@/hooks/useBankAccountOperation';
import { useThemeContext } from '@/contexts/ThemedContext';
import { formatToCurrency } from '@/utils/formatter';
import { FontSize } from '@/utils/Typography';
import CustomSwitch from './Switch';

const schema = z.object({
  exp_ba_name: z.string().trim().min(3, { message: 'Name should be minimum 3 characters' }),
  exp_ba_balance: z
    .string()
    .refine((val) => !val || /^(\d+)(\.\d{1,3})?$/.test(val), {
      message: 'Please enter a valid amount',
    })
    .optional(),
  exp_ba_icon: z.string().optional(),
  exp_ba_is_primary: z.boolean().optional(),
});

type BankAccount = z.infer<typeof schema>;

const AddAccount = ({ account, exp_ba_id }: { account?: BankAccount; exp_ba_id?: string }) => {
  const { colors } = useThemeContext();
  const [show, setShow] = useState(false);
  const { mutateAsync: addBankAccount, isPending: isLoading } = useAddBankAccount();
  const { mutateAsync: updateBankAccount, isPending: isUpdating } = useUpdateBankAccount();
  const { mutateAsync: setPrimaryAccount, isPending: isSettingPrimary } =
    useSetPrimaryBankAccount();

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
      exp_ba_is_primary: false,
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
      // exp_ba_balance is intentionally omitted here - it's the live running
      // balance maintained by transactions, not something this form should touch.
      const body = {
        exp_ba_name: data.exp_ba_name,
        exp_ba_icon: data.exp_ba_icon || 'attach-money',
        exp_ba_id,
      };
      updateBankAccount({ ...body })
        .then(() => {
          // Only ever promotes to primary here - setPrimaryAccount unsets it on
          // every other account, so it's never called when already primary.
          if (data.exp_ba_is_primary && !account?.exp_ba_is_primary) {
            return setPrimaryAccount(exp_ba_id);
          }
        })
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
          <View style={[styles.iconWrapper, { backgroundColor: `${colors.primary}1A` }]}>
            <MaterialCommunityIcons name="circle-edit-outline" size={20} color={colors.primary} />
          </View>
        ) : (
          <LinearGradient
            colors={AddAccountButtonGradient as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.addbutton]}>
            <Text style={[styles.text, { color: colors.onPrimary }]}>Add New</Text>
          </LinearGradient>
        )}
      </Pressable>

      <ModalCard
        visible={show}
        onClose={toggleModal}
        title={exp_ba_id ? 'Edit Account' : 'Add Account'}
        closeDisabled={isLoading || isUpdating || isSettingPrimary}>
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
        {!!exp_ba_id && (
          <>
            <Spacer height={20} />
            <Input
              label="Current Balance"
              value={formatToCurrency(account?.exp_ba_balance ?? 0)}
              editable={false}
              borderLess
            />
          </>
        )}
        <Spacer height={20} />
        {account?.exp_ba_is_primary ? (
          <View
            style={[
              styles.primaryCard,
              { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
            ]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.primaryTitle, { color: colors.title }]}>Primary Account</Text>
              <Text style={[styles.primarySubtitle, { color: colors.description }]}>
                This is your default account
              </Text>
            </View>
            <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
          </View>
        ) : (
          <View
            style={[
              styles.primaryCard,
              { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
            ]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.primaryTitle, { color: colors.title }]}>Set as Primary</Text>
              <Text style={[styles.primarySubtitle, { color: colors.description }]}>
                Used as the default account filter on your dashboard
              </Text>
            </View>
            <Controller
              control={control}
              render={({ field }) => <CustomSwitch value={field.value} onChange={field.onChange} />}
              name="exp_ba_is_primary"
            />
          </View>
        )}
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
            extraData={selectedIcon}
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
                        backgroundColor: selectedIcon === item ? colors.primary : colors.cardBg,
                        padding: 5,
                        borderRadius: 5,
                      }}>
                      <MaterialIcons
                        name={item as React.ComponentProps<typeof MaterialIcons>['name']}
                        size={24}
                        color={selectedIcon === item ? colors.onPrimary : colors.lighterTitle}
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
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              !isDirty || isLoading || isUpdating || isSettingPrimary ? styles.disable : {},
            ]}
            onPress={handleSubmit(handlePress)}
            disabled={!isDirty || isLoading || isUpdating || isSettingPrimary}>
            {isLoading || isUpdating || isSettingPrimary ? (
              <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
            ) : null}
            <Text
              style={[
                styles.btntitle,
                { color: colors.onPrimary },
                isLoading || isUpdating || isSettingPrimary ? styles.textDisable : {},
              ]}>
              {exp_ba_id ? 'Update' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      </ModalCard>
    </>
  );
};

export default AddAccount;

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
    opacity: 0.6,
  },
  textDisable: { opacity: 0 },
  iconBox: {
    alignItems: 'center',
    borderRadius: 8,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontFamily: 'Inter-500',
  },
  primaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  primaryTitle: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-600',
  },
  primarySubtitle: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    marginTop: 2,
  },
  addbutton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AddAccountButtonGradient[1],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontFamily: 'Inter-600',
  },
});
