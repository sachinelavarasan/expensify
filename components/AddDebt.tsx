import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Spacer from './Spacer';
import ModalCard from './ModalCard';
import CustomRadioButton from './CustomRadioButton';
import DatePickerPaper from './DatePickerPaper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import Input from './Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { showToast } from './ToastMessage';
import { debtDirectionType } from '@/utils/common-data';
import { useAddDebt, useUpdateDebt } from '@/hooks/useDebtOperation';
import { useThemeContext } from '@/contexts/ThemedContext';
import { getApiErrorMessage } from '@/lib/apiClient';
import { IDebt } from '@/types';

const schema = z.object({
  exp_dt_person_name: z
    .string()
    .trim()
    .min(2, { message: 'Name should be minimum 2 characters' }),
  exp_dt_direction: z.enum(['owed_to_me', 'owed_by_me'], { message: 'Select a direction' }),
  exp_dt_amount: z
    .string()
    .refine((val) => /^(\d+)(\.\d{1,2})?$/.test(val) && parseFloat(val) > 0, {
      message: 'Please enter a valid amount',
    }),
  exp_dt_due_date: z.string().optional(),
  exp_dt_note: z.string().trim().optional(),
});

type DebtFormValues = z.infer<typeof schema>;

const AddDebt = ({ debt, exp_dt_id }: { debt?: IDebt; exp_dt_id?: string }) => {
  const { colors } = useThemeContext();
  const [show, setShow] = useState(false);
  const { mutateAsync: addDebt, isPending: isLoading } = useAddDebt();
  const { mutateAsync: updateDebt, isPending: isUpdating } = useUpdateDebt();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<DebtFormValues>({
    defaultValues: {
      exp_dt_person_name: '',
      exp_dt_direction: 'owed_to_me',
      exp_dt_amount: '',
      exp_dt_due_date: '',
      exp_dt_note: '',
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (debt) {
      reset(
        {
          exp_dt_person_name: debt.exp_dt_person_name,
          exp_dt_direction: debt.exp_dt_direction,
          exp_dt_amount: debt.exp_dt_amount,
          exp_dt_due_date: debt.exp_dt_due_date || '',
          exp_dt_note: debt.exp_dt_note || '',
        },
        {
          keepDirty: false,
          keepIsValidating: true,
        },
      );
    }
  }, [debt, reset]);

  const toggleModal = () => {
    setShow(!show);
    reset();
  };

  const handlePress = (data: DebtFormValues) => {
    const body = {
      ...data,
      exp_dt_due_date: data.exp_dt_due_date || null,
      exp_dt_note: data.exp_dt_note || null,
    };

    const request = exp_dt_id
      ? updateDebt({ id: exp_dt_id, data: body })
      : addDebt(body);

    request
      .then(() => {
        showToast({
          text1: exp_dt_id ? 'Debt updated successfully' : 'Debt added successfully',
          type: 'success',
          position: 'bottom',
        });
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
      });
  };

  return (
    <>
      {exp_dt_id ? (
        <Pressable onPress={toggleModal} style={{ borderRadius: 40, overflow: 'hidden' }}>
          <View style={[styles.iconWrapper, { backgroundColor: `${colors.primary}1A` }]}>
            <MaterialCommunityIcons name="circle-edit-outline" size={20} color={colors.primary} />
          </View>
        </Pressable>
      ) : (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={toggleModal}>
          <Text style={[styles.text, { color: colors.onPrimary }]}>+ Add Debt</Text>
        </TouchableOpacity>
      )}

      <ModalCard
        visible={show}
        onClose={toggleModal}
        title={exp_dt_id ? 'Edit Debt' : 'Add Debt'}
        closeDisabled={isLoading || isUpdating}>
        <Controller
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Person"
              placeholder="Who is this with?"
              keyboardType="default"
              autoCapitalize="words"
              autoComplete="off"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={errors.exp_dt_person_name?.message}
              borderLess
              isRequired
            />
          )}
          name="exp_dt_person_name"
        />
        <Spacer height={20} />
        <Controller
          control={control}
          render={({ field }) => (
            <CustomRadioButton
              label="Direction"
              value={field.value}
              options={debtDirectionType}
              onChange={(data) => field.onChange(data)}
              isRequired
            />
          )}
          name="exp_dt_direction"
        />
        {errors.exp_dt_direction?.message ? (
          <Text style={[styles.errorMessage, { color: colors.expense }]}>
            {errors.exp_dt_direction?.message}
          </Text>
        ) : null}
        <Spacer height={20} />
        <Controller
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Amount"
              keyboardType="numeric"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={errors.exp_dt_amount?.message}
              borderLess
              isRequired
            />
          )}
          name="exp_dt_amount"
        />
        <Spacer height={20} />
        <Controller
          control={control}
          render={({ field }) => (
            <DatePickerPaper
              value={field.value}
              onBlur={field.onBlur}
              onChange={(date) => field.onChange(date)}
              placeholder="Select due date (optional)"
              error={errors.exp_dt_due_date?.message}
            />
          )}
          name="exp_dt_due_date"
        />
        <Spacer height={20} />
        <Controller
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ''}
              label="Note"
              placeholder="Optional note"
              keyboardType="default"
              autoCapitalize="none"
              autoComplete="off"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={errors.exp_dt_note?.message}
              borderLess
              multiline
              numberOfLines={3}
              isTextBox
            />
          )}
          name="exp_dt_note"
        />
        <Spacer height={20} />
        <View>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              !isDirty || isLoading || isUpdating ? styles.disable : {},
            ]}
            onPress={handleSubmit(handlePress)}
            disabled={!isDirty || isLoading || isUpdating}>
            {isLoading || isUpdating ? (
              <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
            ) : null}
            <Text
              style={[
                styles.btntitle,
                { color: colors.onPrimary },
                isLoading || isUpdating ? styles.textDisable : {},
              ]}>
              {exp_dt_id ? 'Update' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      </ModalCard>
    </>
  );
};

export default AddDebt;

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
  errorMessage: {
    fontSize: 12,
    fontFamily: 'Inter-300',
    letterSpacing: 0.5,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
