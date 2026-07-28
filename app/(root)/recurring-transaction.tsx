import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

import Input from '@/components/Input';
import Spacer from '@/components/Spacer';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import CustomRadioButton from '@/components/CustomRadioButton';
import CategorySelector from '@/components/CategorySelector';
import { CustomSelectInput } from '@/components/CustomSelectInput';
import DatePickerPaper from '@/components/DatePickerPaper';
import CustomSwitch from '@/components/Switch';
import ProfileHeader from '@/components/ProfileHeader';
import OverlayLoader from '@/components/Overlay';
import { showToast } from '@/components/ToastMessage';

import { recurringTransactionSchema, recurringTransactionSchemaType } from '@/utils/schema';
import { TransactionType, recurringFrequencyType } from '@/utils/common-data';
import { useGetCategoryCache } from '@/hooks/useCategoryListOperation';
import { useGetUserBankAccounts } from '@/hooks/useBankAccountOperation';
import {
  useAddRecurringTransaction,
  useDeleteRecurringTransaction,
  useRecurringTransactions,
  useUpdateRecurringTransaction,
} from '@/hooks/useRecurringTransaction';
import { useThemeContext } from '@/contexts/ThemedContext';
import { Spacing } from '@/utils/Spacing';
import { FontSize } from '@/utils/Typography';

export default function RecurringTransaction() {
  const { colors } = useThemeContext();
  const router = useRouter();
  const { exp_rt_id } = useLocalSearchParams<{ exp_rt_id?: string }>();

  const { categories } = useGetCategoryCache();
  const { accounts } = useGetUserBankAccounts();
  const { recurringTransactions, loading: isFetching } = useRecurringTransactions();
  const { mutateAsync: addRecurringTransaction, isPending: isAdding } =
    useAddRecurringTransaction();
  const { mutateAsync: updateRecurringTransaction, isPending: isUpdating } =
    useUpdateRecurringTransaction();
  const { mutateAsync: deleteRecurringTransaction, isPending: isDeleting } =
    useDeleteRecurringTransaction();

  const isLoading = isAdding || isUpdating;

  const existing = useMemo(
    () => recurringTransactions.find((item) => item.exp_rt_id === exp_rt_id),
    [recurringTransactions, exp_rt_id],
  );

  const [hasEndDate, setHasEndDate] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      exp_rt_title: '',
      exp_rt_note: '',
      exp_rt_amount: undefined,
      exp_rt_category_id: undefined,
      exp_rt_transaction_type_id: 1,
      exp_rt_bank_account_id: undefined,
      exp_rt_frequency: 'monthly',
      exp_rt_start_date: '',
      exp_rt_end_date: '',
    },
    resolver: zodResolver(recurringTransactionSchema),
  });

  const exp_rt_transaction_type_id = watch('exp_rt_transaction_type_id');

  useEffect(() => {
    if (existing) {
      setHasEndDate(!!existing.exp_rt_end_date);
      reset(
        {
          exp_rt_title: existing.exp_rt_title,
          exp_rt_note: existing.exp_rt_note || '',
          exp_rt_amount: existing.exp_rt_amount,
          exp_rt_category_id: existing.exp_rt_category_id,
          exp_rt_transaction_type_id: existing.exp_rt_transaction_type_id,
          exp_rt_bank_account_id: existing.exp_rt_bank_account_id || undefined,
          exp_rt_frequency: existing.exp_rt_frequency,
          exp_rt_start_date: existing.exp_rt_start_date,
          exp_rt_end_date: existing.exp_rt_end_date || '',
        },
        {
          keepDirty: false,
          keepIsValidating: true,
        },
      );
    } else if (!exp_rt_id) {
      const primary = accounts.find((a) => a.exp_ba_is_primary);
      if (primary) {
        setValue('exp_rt_bank_account_id', primary.exp_ba_id);
      }
    }
  }, [existing, exp_rt_id, accounts, reset, setValue]);

  const categoriesList = useMemo(
    () =>
      categories.filter((cate) => cate.exp_tc_transaction_type === exp_rt_transaction_type_id) ||
      [],
    [categories, exp_rt_transaction_type_id],
  );

  const redirectToCategory = () => {
    router.push('/categories');
  };

  const onSubmit = (data: recurringTransactionSchemaType) => {
    const formattedData = {
      ...data,
      exp_rt_end_date: hasEndDate ? data.exp_rt_end_date || null : null,
    };

    const request = existing
      ? updateRecurringTransaction({ ...formattedData, exp_rt_id: existing.exp_rt_id })
      : addRecurringTransaction(formattedData);

    request
      .then(() => {
        showToast({
          text1: existing
            ? 'Recurring transaction updated successfully'
            : 'Recurring transaction added successfully',
          type: 'success',
          position: 'bottom',
        });
        router.back();
      })
      .catch(() => {
        showToast({
          text1: 'Server Error',
          type: 'error',
          position: 'bottom',
        });
      });
  };

  const handleDelete = async () => {
    if (!existing) return;
    const confirm = await new Promise((resolve) =>
      Alert.alert(
        'Delete this recurring transaction?',
        'Are you sure you want to delete this recurring transaction?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
        ],
      ),
    );

    if (!confirm) return;

    deleteRecurringTransaction(existing.exp_rt_id)
      .then(() => {
        showToast({
          text1: 'The recurring transaction has been removed.',
          type: 'success',
          position: 'bottom',
        });
        router.back();
      })
      .catch(() => {
        showToast({
          text1: 'Server Error',
          type: 'error',
          position: 'bottom',
        });
      });
  };

  return (
    <SafeAreaViewComponent>
      <View style={{ flex: 1 }}>
        {(isFetching || isDeleting || isLoading) && <OverlayLoader />}
        <ThemedView style={{ flex: 1, paddingHorizontal: 5 }}>
          <KeyboardAvoidingView
            {...(Platform.OS === 'ios' ? { behavior: 'padding' } : { behavior: 'height' })}
            style={{ flex: 1 }}>
            <FlatList
              bounces={false}
              showsVerticalScrollIndicator={false}
              data={[0]}
              ListHeaderComponent={() => (
                <View>
                  <Spacer height={5} />
                  <ProfileHeader
                    title={existing ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
                  />
                </View>
              )}
              renderItem={() => (
                <View style={styles.formContainer}>
                  <View style={styles.sectionContainer}>
                    <Controller
                      control={control}
                      name="exp_rt_bank_account_id"
                      render={({ field }) => (
                        <CustomSelectInput
                          {...field}
                          value={field.value}
                          options={accounts.map((account) => ({
                            key: account.exp_ba_id,
                            value: account.exp_ba_name,
                          }))}
                          placeholder="Select account"
                          label="Choose Account"
                          onChange={(selectedId) => field.onChange(selectedId)}
                          error={errors.exp_rt_bank_account_id?.message}
                        />
                      )}
                    />

                    <Spacer height={Spacing.xl} />
                    <Controller
                      control={control}
                      render={({ field }) => (
                        <DatePickerPaper
                          {...field}
                          onBlur={field.onBlur}
                          onChange={(data) => field.onChange(data)}
                          value={field.value}
                          label="Start Date"
                          placeholder="Select start date"
                          error={errors.exp_rt_start_date?.message}
                          isRequired
                        />
                      )}
                      name="exp_rt_start_date"
                    />

                    <Spacer height={Spacing.xl} />
                    <Controller
                      control={control}
                      render={({ field }) => (
                        <CustomRadioButton
                          label="Repeats"
                          value={field.value}
                          options={recurringFrequencyType.filter((freq) => freq.id === 'monthly')}
                          onChange={field.onChange}
                          isRequired
                        />
                      )}
                      name="exp_rt_frequency"
                    />
                    {errors.exp_rt_frequency?.message ? (
                      <Text style={[styles.errorMessage, { color: colors.expense }]}>
                        {errors.exp_rt_frequency?.message}
                      </Text>
                    ) : null}

                    <Spacer height={Spacing.xl} />
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={[styles.label, { color: colors.title }]}>Set an end date</Text>
                      <CustomSwitch
                        value={hasEndDate}
                        onChange={(value) => {
                          setHasEndDate(value);
                          if (!value) setValue('exp_rt_end_date', '', { shouldDirty: true });
                        }}
                      />
                    </View>
                    {hasEndDate ? (
                      <>
                        <Spacer height={Spacing.md} />
                        <Controller
                          control={control}
                          render={({ field }) => (
                            <DatePickerPaper
                              {...field}
                              onBlur={field.onBlur}
                              onChange={(data) => field.onChange(data)}
                              value={field.value ?? undefined}
                              placeholder="Select end date"
                              error={errors.exp_rt_end_date?.message}
                            />
                          )}
                          name="exp_rt_end_date"
                        />
                      </>
                    ) : null}

                    <Spacer height={Spacing.xl} />
                    <Controller
                      control={control}
                      render={({ field }) => (
                        <CustomRadioButton
                          label="Transaction Type"
                          value={field.value}
                          options={TransactionType}
                          onChange={field.onChange}
                          isRequired
                        />
                      )}
                      name="exp_rt_transaction_type_id"
                    />
                    {errors.exp_rt_transaction_type_id?.message ? (
                      <Text style={[styles.errorMessage, { color: colors.expense }]}>
                        {errors.exp_rt_transaction_type_id?.message}
                      </Text>
                    ) : null}

                    <Spacer height={Spacing.xl} />
                    <Controller
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Transaction amount"
                          label="Amount"
                          keyboardType="numeric"
                          onBlur={field.onBlur}
                          onChangeText={field.onChange}
                          error={errors.exp_rt_amount?.message}
                          borderLess
                          isRequired
                        />
                      )}
                      name="exp_rt_amount"
                    />

                    <Spacer height={Spacing.xl} />
                    <Controller
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          placeholder="Title"
                          label="Title"
                          keyboardType="default"
                          autoCapitalize="none"
                          autoComplete="off"
                          onBlur={field.onBlur}
                          onChangeText={field.onChange}
                          error={errors.exp_rt_title?.message}
                          borderLess
                          isRequired
                        />
                      )}
                      name="exp_rt_title"
                    />

                    <Spacer height={Spacing.xl} />
                    <Controller
                      control={control}
                      name="exp_rt_category_id"
                      render={({ field }) => (
                        <View>
                          <View
                            style={{
                              borderColor: colors.inputBorder,
                              borderWidth: 1,
                              borderRadius: 8,
                              paddingVertical: 5,
                              paddingHorizontal: 8,
                              backgroundColor: colors.inputColor,
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                paddingVertical: 10,
                                paddingHorizontal: 5,
                                flexWrap: 'wrap',
                              }}>
                              <Text
                                style={[
                                  styles.categoryLabel,
                                  {
                                    flex: 1,
                                    flexWrap: 'wrap',
                                    lineHeight: 20,
                                    color: colors.title,
                                  },
                                ]}>
                                Category
                                {!!categoriesList.find((item) => item.exp_tc_id === field.value)
                                  ?.exp_tc_label && (
                                  <Text
                                    style={{
                                      fontFamily: 'Inter-500',
                                      color: colors.text,
                                    }}>
                                    {' '}
                                    :{' '}
                                    {
                                      categoriesList.find((item) => item.exp_tc_id === field.value)
                                        ?.exp_tc_label
                                    }
                                  </Text>
                                )}
                              </Text>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  gap: 10,
                                  marginLeft: 30,
                                }}>
                                <TouchableOpacity
                                  activeOpacity={0.2}
                                  style={{
                                    paddingHorizontal: 10,
                                  }}
                                  onPress={redirectToCategory}>
                                  <MaterialIcons name="edit" size={22} color={colors.text} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  activeOpacity={0.2}
                                  style={{
                                    paddingHorizontal: 10,
                                  }}
                                  onPress={redirectToCategory}>
                                  <MaterialIcons name="add" size={22} color={colors.text} />
                                </TouchableOpacity>
                              </View>
                            </View>

                            <CategorySelector
                              categories={categoriesList}
                              selected={field.value}
                              onSelect={(id) => field.onChange(id)}
                            />
                          </View>

                          {errors.exp_rt_category_id?.message ? (
                            <Text style={[styles.errorMessage, { color: colors.expense }]}>
                              {errors.exp_rt_category_id?.message}
                            </Text>
                          ) : null}
                        </View>
                      )}
                    />
                  </View>

                  <Spacer height={Spacing.lg} />
                  <Controller
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder="Notes"
                        label="Note"
                        keyboardType="default"
                        autoCapitalize="none"
                        autoComplete="off"
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        error={errors.exp_rt_note?.message}
                        borderLess
                        multiline={true}
                        numberOfLines={4}
                        isTextBox
                      />
                    )}
                    name="exp_rt_note"
                  />
                  <Spacer height={70} />
                </View>
              )}
              keyExtractor={() => 'form-recurring-transaction'}
            />
          </KeyboardAvoidingView>
        </ThemedView>
        <View style={[styles.footer, { backgroundColor: colors.barBackground }]}>
          <View>
            {existing ? (
              <TouchableOpacity onPress={handleDelete} disabled={isLoading}>
                <FontAwesome5 name="trash" size={20} color={colors.text} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primary },
                !isDirty || isFetching || isDeleting || isLoading ? styles.disable : {},
              ]}
              disabled={!isDirty || isFetching || isDeleting || isLoading}
              onPress={handleSubmit(onSubmit)}>
              {isLoading ? (
                <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
              ) : null}
              <Text
                style={[
                  styles.title,
                  { color: colors.onPrimary },
                  isLoading ? styles.textDisable : {},
                ]}>
                {existing ? 'Update' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaViewComponent>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  sectionContainer: {
    marginVertical: 10,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter-400',
  },
  categoryLabel: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-500',
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 50,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 9,
    width: 'auto',
  },
  loader: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.md,
    fontFamily: 'Inter-600',
  },
  disable: {
    opacity: 0.7,
  },
  textDisable: { opacity: 0 },
  errorMessage: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-300',
    letterSpacing: 0.5,
  },
  footer: {
    elevation: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
  },
});
