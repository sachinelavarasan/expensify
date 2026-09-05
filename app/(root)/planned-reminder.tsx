import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';

import Spacer from '@/components/Spacer';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import CustomRadioButton from '@/components/CustomRadioButton';
import SegmentedControl from '@/components/SegmentedControl';
import CategoryPickerSheet from '@/components/CategoryPickerSheet';
import RowInput from '@/components/RowInput';
import RowSelectInput from '@/components/RowSelectInput';
import RowDatePicker from '@/components/RowDatePicker';
import AmountCalculator from '@/components/AmountCalculator';
import CustomSwitch from '@/components/Switch';
import TimePickerPaperWithButton from '@/components/TimePickerPaperWithButton';
import ProfileHeader from '@/components/ProfileHeader';
import OverlayLoader from '@/components/Overlay';
import { showToast } from '@/components/ToastMessage';

import { plannedReminderSchema, plannedReminderSchemaType } from '@/utils/schema';
import { CoreTransactionType, recurringFrequencyType } from '@/utils/common-data';
import { useGetCategoryCache } from '@/hooks/useCategoryListOperation';
import { useGetUserBankAccounts } from '@/hooks/useBankAccountOperation';
import {
  useAddRecurringTransaction,
  useDeleteRecurringTransaction,
  useRecurringTransactions,
  useUpdateRecurringTransaction,
} from '@/hooks/useRecurringTransaction';
import { useThemeContext } from '@/contexts/ThemedContext';
import { getApiErrorMessage } from '@/lib/apiClient';
import { getAppCurrency } from '@/utils/functions';
import { Spacing } from '@/utils/Spacing';
import { FontSize } from '@/utils/Typography';
import { useConfirm } from '@/hooks/useConfirm';

const DEFAULT_REMINDER_TIME = '08:00 AM';

export default function PlannedReminder() {
  const { confirm, confirmModal } = useConfirm();
  const { colors } = useThemeContext();
  const router = useRouter();
  const { exp_rt_id, kind } = useLocalSearchParams<{
    exp_rt_id?: string;
    kind?: 'recurring' | 'reminder';
  }>();

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
  const [calculatorVisible, setCalculatorVisible] = useState(false);

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
      exp_rt_reminder_enabled: kind === 'reminder',
      exp_rt_reminder_days_before: 0,
      exp_rt_reminder_time: DEFAULT_REMINDER_TIME,
      exp_rt_kind: kind === 'reminder' ? 'reminder' : 'recurring',
    },
    resolver: zodResolver(plannedReminderSchema),
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
          // Reminder settings are only user-configurable for payment
          // reminders now (no toggle, no days-before) - force them
          // consistently by kind regardless of legacy stored values.
          exp_rt_reminder_enabled: existing.exp_rt_kind === 'reminder',
          exp_rt_reminder_days_before: 0,
          exp_rt_reminder_time: existing.exp_rt_reminder_time || DEFAULT_REMINDER_TIME,
          exp_rt_kind: existing.exp_rt_kind,
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

  const selectedTypeLabel = useMemo(
    () =>
      CoreTransactionType.find((t) => t.id === exp_rt_transaction_type_id)?.label.toLowerCase() ??
      'transaction',
    [exp_rt_transaction_type_id],
  );

  const resolvedKind = existing?.exp_rt_kind ?? (kind === 'reminder' ? 'reminder' : 'recurring');
  const kindLabel = resolvedKind === 'reminder' ? 'payment reminder' : 'recurring transaction';
  // Recurring transactions keep the original monthly-only restriction; the
  // full frequency range is only available for payment reminders.
  const frequencyOptions =
    resolvedKind === 'recurring'
      ? recurringFrequencyType.filter((freq) => freq.id === 'monthly')
      : recurringFrequencyType;
  const screenTitle =
    resolvedKind === 'reminder'
      ? existing
        ? 'Edit Payment Reminder'
        : 'Add Payment Reminder'
      : existing
        ? 'Edit Recurring Transaction'
        : 'Add Recurring Transaction';

  const redirectToCategory = () => {
    router.push('/categories');
  };

  const onSubmit = (data: plannedReminderSchemaType) => {
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
            ? `${kindLabel[0].toUpperCase()}${kindLabel.slice(1)} updated successfully`
            : `${kindLabel[0].toUpperCase()}${kindLabel.slice(1)} added successfully`,
          type: 'success',
          position: 'bottom',
        });
        router.back();
      })
      .catch((err) => {
        showToast({
          text1: getApiErrorMessage(err, 'Server Error'),
          type: 'error',
          position: 'bottom',
        });
      });
  };

  const handleDelete = async () => {
    if (!existing) return;
    const confirmed = await confirm({
      title: `Delete this ${kindLabel}?`,
      message: `Are you sure you want to delete this ${kindLabel}?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true,
    });

    if (!confirmed) return;

    deleteRecurringTransaction(existing.exp_rt_id)
      .then(() => {
        showToast({
          text1: `The ${kindLabel} has been removed.`,
          type: 'success',
          position: 'bottom',
        });
        router.back();
      })
      .catch((err) => {
        showToast({
          text1: getApiErrorMessage(err, 'Server Error'),
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
                  <ProfileHeader title={screenTitle} />
                </View>
              )}
              renderItem={() => (
                <View style={styles.formContainer}>
                  <Controller
                    control={control}
                    render={({ field }) => (
                      <SegmentedControl
                        value={field.value}
                        options={CoreTransactionType}
                        onChange={field.onChange}
                      />
                    )}
                    name="exp_rt_transaction_type_id"
                  />
                  {errors.exp_rt_transaction_type_id?.message ? (
                    <Text style={[styles.errorMessage, { color: colors.expense }]}>
                      {errors.exp_rt_transaction_type_id?.message}
                    </Text>
                  ) : null}
                  <Spacer height={Spacing.lg} />

                  <Text style={[styles.cardLabel, { color: colors.lighterTitle }]}>Details</Text>
                  <View
                    style={[
                      styles.card,
                      { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
                    ]}>
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
                            placeholder="Transaction amount"
                            keyboardType="numeric"
                            onBlur={field.onBlur}
                            onChangeText={field.onChange}
                            error={errors.exp_rt_amount?.message}
                            style={{ color: colors.primary, fontSize: FontSize.xxl }}
                            cursorColor={colors.primary}
                            selectionColor={colors.primary + '40'}
                            trailing={
                              <TouchableOpacity
                                onPress={() => setCalculatorVisible(true)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                style={styles.trailingIconBadge}>
                                <Ionicons
                                  name="calculator-outline"
                                  size={20}
                                  color={colors.primary}
                                />
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
                      name="exp_rt_amount"
                    />
                    <Controller
                      control={control}
                      render={({ field }) => (
                        <RowInput
                          icon={
                            <Text style={[styles.rowGlyph, { color: colors.primary }]}>Aa</Text>
                          }
                          label="Title"
                          value={field.value ?? ''}
                          placeholder="Title"
                          keyboardType="default"
                          autoCapitalize="none"
                          autoComplete="off"
                          onBlur={field.onBlur}
                          onChangeText={field.onChange}
                          error={errors.exp_rt_title?.message}
                        />
                      )}
                      name="exp_rt_title"
                    />
                    <Controller
                      control={control}
                      name="exp_rt_bank_account_id"
                      render={({ field }) => (
                        <RowSelectInput
                          icon={
                            <MaterialIcons
                              name="account-balance"
                              size={17}
                              color={colors.primary}
                            />
                          }
                          value={field.value ?? ''}
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
                    <Controller
                      control={control}
                      render={({ field }) => (
                        <RowDatePicker
                          {...field}
                          onBlur={field.onBlur}
                          onChange={(data) => field.onChange(data)}
                          value={field.value}
                          label="Start Date"
                          placeholder="Select start date"
                          error={errors.exp_rt_start_date?.message}
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
                          options={frequencyOptions}
                          onChange={field.onChange}
                          isRequired
                          grid={resolvedKind !== 'recurring'}
                        />
                      )}
                      name="exp_rt_frequency"
                    />
                    {errors.exp_rt_frequency?.message ? (
                      <Text style={[styles.errorMessage, { color: colors.expense }]}>
                        {errors.exp_rt_frequency?.message}
                      </Text>
                    ) : null}

                    {resolvedKind === 'reminder' ? (
                      <>
                        <Spacer height={Spacing.md} />
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={[styles.label, { color: colors.title }]}>
                            Reminder Time
                          </Text>
                          <Controller
                            control={control}
                            render={({ field }) => (
                              <TimePickerPaperWithButton
                                value={field.value || DEFAULT_REMINDER_TIME}
                                onChange={field.onChange}
                              />
                            )}
                            name="exp_rt_reminder_time"
                          />
                        </View>
                      </>
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
                            <RowDatePicker
                              {...field}
                              onBlur={field.onBlur}
                              onChange={(data) => field.onChange(data)}
                              value={field.value ?? undefined}
                              placeholder="Select end date"
                              error={errors.exp_rt_end_date?.message}
                              showDivider={false}
                            />
                          )}
                          name="exp_rt_end_date"
                        />
                      </>
                    ) : null}

                  </View>

                  <Spacer height={Spacing.lg} />
                  <Text style={[styles.cardLabel, { color: colors.lighterTitle }]}>Category</Text>
                  <View
                    style={[
                      styles.card,
                      {
                        backgroundColor: colors.cardBg,
                        borderColor: errors.exp_rt_category_id?.message
                          ? colors.expense
                          : colors.borderColor,
                      },
                    ]}>
                    <Controller
                      control={control}
                      name="exp_rt_category_id"
                      render={({ field }) => (
                        <CategoryPickerSheet
                          icon={<MaterialIcons name="category" size={17} color={colors.primary} />}
                          label="Category"
                          value={field.value}
                          categories={categoriesList}
                          onSelect={field.onChange}
                          onAddCategory={redirectToCategory}
                          error={errors.exp_rt_category_id?.message}
                        />
                      )}
                    />
                  </View>

                  <Spacer height={Spacing.lg} />
                  <Text style={[styles.cardLabel, { color: colors.lighterTitle }]}>Extras</Text>
                  <View
                    style={[
                      styles.card,
                      { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
                    ]}>
                    <Controller
                      control={control}
                      render={({ field }) => (
                        <RowInput
                          icon={<MaterialIcons name="notes" size={18} color={colors.primary} />}
                          label="Note"
                          value={field.value ?? ''}
                          placeholder="Notes"
                          keyboardType="default"
                          autoCapitalize="none"
                          autoComplete="off"
                          onBlur={field.onBlur}
                          onChangeText={field.onChange}
                          error={errors.exp_rt_note?.message}
                          multiline
                          numberOfLines={4}
                          isTextBox
                          showDivider={false}
                        />
                      )}
                      name="exp_rt_note"
                    />
                  </View>
                  <Spacer height={70} />
                </View>
              )}
              keyExtractor={() => 'form-planned-reminder'}
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
                {`${existing ? 'Update' : 'Save'} ${selectedTypeLabel}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {confirmModal}
      </View>
    </SafeAreaViewComponent>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter-400',
  },
  cardLabel: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.lg,
  },
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
