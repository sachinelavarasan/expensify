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
import SegmentedControl from './SegmentedControl';
import RowInput from './RowInput';
import RowDatePicker from './RowDatePicker';
import AmountCalculator from './AmountCalculator';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { showToast } from './ToastMessage';
import { debtDirectionType } from '@/utils/common-data';
import { useAddDebt, useUpdateDebt } from '@/hooks/useDebtOperation';
import { useThemeContext } from '@/contexts/ThemedContext';
import { getApiErrorMessage } from '@/lib/apiClient';
import { getAppCurrency } from '@/utils/functions';
import { FontSize } from '@/utils/Typography';
import { Spacing } from '@/utils/Spacing';
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
  const [calculatorVisible, setCalculatorVisible] = useState(false);
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
            <SegmentedControl
              label="Direction"
              value={field.value}
              options={debtDirectionType}
              onChange={(data) => field.onChange(data)}
            />
          )}
          name="exp_dt_direction"
        />
        {errors.exp_dt_direction?.message ? (
          <Text style={[styles.errorMessage, { color: colors.expense }]}>
            {errors.exp_dt_direction?.message}
          </Text>
        ) : null}
        <Spacer height={Spacing.lg} />

        <Controller
          control={control}
          render={({ field }) => (
            <RowInput
              icon={<Text style={[styles.rowGlyph, { color: colors.primary }]}>Aa</Text>}
              label="Person"
              value={field.value}
              placeholder="Who is this with?"
              keyboardType="default"
              autoCapitalize="words"
              autoComplete="off"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={errors.exp_dt_person_name?.message}
            />
          )}
          name="exp_dt_person_name"
        />
        <Controller
          control={control}
          render={({ field }) => (
            <>
              <RowInput
                icon={
                  <Text style={[styles.rowGlyph, { color: colors.primary }]}>
                    {getAppCurrency()}
                  </Text>
                }
                label="Amount"
                value={field.value}
                placeholder="Amount"
                keyboardType="numeric"
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                error={errors.exp_dt_amount?.message}
                style={{ color: colors.primary, fontSize: FontSize.xxl }}
                cursorColor={colors.primary}
                selectionColor={colors.primary + '40'}
                trailing={
                  <TouchableOpacity
                    onPress={() => setCalculatorVisible(true)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.trailingIconBadge}>
                    <Ionicons name="calculator-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                }
              />
              <AmountCalculator
                visible={calculatorVisible}
                onClose={() => setCalculatorVisible(false)}
                initialValue={field.value}
                onApply={(value) => {
                  field.onChange(value);
                  setCalculatorVisible(false);
                }}
              />
            </>
          )}
          name="exp_dt_amount"
        />
        <Controller
          control={control}
          render={({ field }) => (
            <RowDatePicker
              value={field.value}
              onBlur={field.onBlur}
              onChange={(date) => field.onChange(date)}
              label="Due Date"
              placeholder="Select due date (optional)"
              error={errors.exp_dt_due_date?.message}
            />
          )}
          name="exp_dt_due_date"
        />
        <Controller
          control={control}
          render={({ field }) => (
            <RowInput
              icon={<MaterialCommunityIcons name="note-text-outline" size={18} color={colors.primary} />}
              label="Note"
              value={field.value ?? ''}
              placeholder="Optional note"
              keyboardType="default"
              autoCapitalize="none"
              autoComplete="off"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={errors.exp_dt_note?.message}
              multiline
              numberOfLines={3}
              isTextBox
              showDivider={false}
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
  rowGlyph: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-700',
  },
  trailingIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 14,
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
