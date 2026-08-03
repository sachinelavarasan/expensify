import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';

import Input from '@/components/Input';
import Spacer from '@/components/Spacer';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import CustomRadioButton from '@/components/CustomRadioButton';
import ModalCard from '@/components/ModalCard';
import TagInput from '@/components/TagInput';
import AttachmentPicker, { AttachmentValue } from '@/components/AttachmentPicker';
import {
  useDeleteTransactionAttachment,
  useUploadTransactionAttachment,
} from '@/hooks/useTransactionAttachment';
import TemplateChip from '@/components/TemplateChip';
import { useTransactionTemplates, ITransactionTemplate } from '@/hooks/useTransactionTemplates';
import CategorySuggestionChip from '@/components/CategorySuggestionChip';
import { useAICategorySuggestion } from '@/hooks/useAICategorySuggestion';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

import { transactionSchema, transactionSchemaType } from '@/utils/schema';
import { TransactionType } from '@/utils/common-data';
import { useGetCategoryCache } from '@/hooks/useCategoryListOperation';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import OverlayLoader from '@/components/Overlay';
import {
  useCreateTransfer,
  useDeleteTransaction,
  useFetchTransaction,
  useSaveTransaction,
} from '@/hooks/useTransaction';
import { showToast } from '@/components/ToastMessage';
import { notifyBudgetThresholdIfCrossed } from '@/utils/notifyBudgetThreshold';
import ProfileHeader from '@/components/ProfileHeader';
import CategorySelector from '@/components/CategorySelector';
import DatePickerPaper from '@/components/DatePickerPaper';
import TimePickerPaper from '@/components/TimePickerPaper';
import { CustomSelectInput } from '@/components/CustomSelectInput';
import { useGetUserBankAccounts } from '@/hooks/useBankAccountOperation';
import { useThemeContext } from '@/contexts/ThemedContext';
import CustomSwitch from '@/components/Switch';
import { Spacing } from '@/utils/Spacing';
import { FontSize } from '@/utils/Typography';
import { formatFullCurrency } from '@/utils/formatter';
import { getApiErrorMessage } from '@/lib/apiClient';

export default function Transaction() {
  const [isBulk, setIsBulk] = useState(false);

  const { colors } = useThemeContext();
  const { categories } = useGetCategoryCache();
  const { accounts } = useGetUserBankAccounts();
  const { exp_ts_id, starred } = useLocalSearchParams() as {
    exp_ts_id?: string;
    starred?: boolean;
  };
  const { data: existingTransaction, isLoading: isFetching } = useFetchTransaction(exp_ts_id);
  const { mutateAsync: saveTransaction, isPending: isLoading } = useSaveTransaction(starred);
  const { mutateAsync: createTransfer, isPending: isCreatingTransfer } = useCreateTransfer();
  const { mutateAsync: uploadAttachment, isPending: isUploadingAttachment } =
    useUploadTransactionAttachment();
  const { mutateAsync: deleteAttachment } = useDeleteTransactionAttachment();
  const isSaving = isLoading || isUploadingAttachment || isCreatingTransfer;
  const { mutateAsync: deleteTransaction, isPending: isDeleting } = useDeleteTransaction();
  const { templates, saveTemplate, deleteTemplate } = useTransactionTemplates();
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const router = useRouter();

  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(12);

  useEffect(() => {
    formOpacity.value = withTiming(1, { duration: 300 });
    formTranslateY.value = withTiming(0, { duration: 300 });
  }, []);

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitted },
    watch,
    reset,
    getValues,
    setValue,
    setError,
    clearErrors,
    trigger,
  } = useForm({
    defaultValues: {
      exp_ts_title: '',
      exp_ts_date: format(new Date(), 'yyyy-MM-dd'),
      exp_ts_note: '',
      exp_ts_time: '',
      exp_ts_amount: undefined,
      exp_tc_id: undefined,
      exp_tt_id: 1,
      exp_st_id: false,
      exp_ts_bank_account_id: undefined,
      exp_ts_to_bank_account_id: undefined,
      exp_ts_tags: [] as string[],
      exp_ts_attachment_url: null as AttachmentValue,
    },
    resolver: zodResolver(transactionSchema),
  });
  const exp_st_id = watch('exp_st_id');
  const exp_tc_id = watch('exp_tc_id');
  const exp_tt_id = watch('exp_tt_id');
  const exp_ts_title = watch('exp_ts_title');
  const exp_ts_bank_account_id = watch('exp_ts_bank_account_id');
  const exp_ts_to_bank_account_id = watch('exp_ts_to_bank_account_id');
  const isTransfer = exp_tt_id === 3;
  // A transfer is delete-only once created - block editing it as a form.
  const isExistingTransfer = !!existingTransaction?.exp_ts_transfer_group_id;

  const [categorySuggestion, setCategorySuggestion] = useState<{
    id: string;
    label: string;
    icon: string;
    iconBgColor: string;
  } | null>(null);
  const [suggestionsDisabled, setSuggestionsDisabled] = useState(false);
  const lastSuggestionKeyRef = useRef<string | null>(null);
  const { mutateAsync: fetchCategorySuggestion } = useAICategorySuggestion();
  const debouncedTitle = useDebouncedValue(exp_ts_title, 600);

  useEffect(() => {
    const trimmedTitle = (debouncedTitle || '').trim();
    const suggestionKey = `${trimmedTitle}::${exp_tt_id}`;

    if (
      exp_ts_id ||
      exp_tc_id ||
      suggestionsDisabled ||
      trimmedTitle.length < 3 ||
      lastSuggestionKeyRef.current === suggestionKey
    ) {
      return;
    }
    lastSuggestionKeyRef.current = suggestionKey;

    fetchCategorySuggestion({ title: trimmedTitle, exp_tt_id })
      .then((categoryId) => {
        const category = categoryId
          ? categories.find((item) => item.exp_tc_id === categoryId)
          : null;
        setCategorySuggestion(
          category
            ? {
                id: category.exp_tc_id,
                label: category.exp_tc_label,
                icon: category.exp_tc_icon,
                iconBgColor: category.exp_tc_icon_bg_color,
              }
            : null,
        );
      })
      .catch(() => setCategorySuggestion(null));
  }, [
    debouncedTitle,
    exp_ts_id,
    exp_tc_id,
    exp_tt_id,
    suggestionsDisabled,
    categories,
    fetchCategorySuggestion,
  ]);

  useEffect(() => {
    if (existingTransaction) {
      reset(
        {
          exp_ts_title: existingTransaction.exp_ts_title || '',
          exp_ts_date: existingTransaction.exp_ts_date || '',
          exp_ts_note: existingTransaction.exp_ts_note || '',
          exp_ts_time: existingTransaction.exp_ts_time || '',
          exp_ts_amount: existingTransaction.exp_ts_amount?.toString() || '',
          exp_tc_id: existingTransaction.exp_tc_id,
          exp_tt_id: existingTransaction.exp_tt_id || 1,
          exp_st_id: !!existingTransaction.exp_st_id,
          exp_ts_bank_account_id: existingTransaction.exp_ts_bank_account_id || undefined,
          exp_ts_tags: existingTransaction.exp_ts_tags || [],
          exp_ts_attachment_url: existingTransaction.exp_ts_attachment_url
            ? { kind: 'remote', url: existingTransaction.exp_ts_attachment_url }
            : null,
        },
        {
          keepDirty: false,
          keepIsValidating: true,
        },
      );
    } else if (!getValues('exp_ts_bank_account_id')) {
      const primary = accounts.find((a) => a.exp_ba_is_primary);
      if (primary) {
        setValue('exp_ts_bank_account_id', primary.exp_ba_id);
      }
    }
  }, [existingTransaction, reset]);

  const onSubmit = async (data: transactionSchemaType & { exp_ts_id?: string }) => {
    if (data.exp_tt_id === 3) {
      const fromAccount = accounts.find((a) => a.exp_ba_id === data.exp_ts_bank_account_id);
      const fromBalance = fromAccount ? parseFloat(fromAccount.exp_ba_balance) || 0 : 0;

      if (parseFloat(data.exp_ts_amount) > fromBalance) {
        setError('exp_ts_amount', {
          type: 'manual',
          message: `Amount exceeds ${fromAccount?.exp_ba_name || 'account'} balance (${formatFullCurrency(fromBalance)})`,
        });
        return;
      }
      clearErrors('exp_ts_amount');

      createTransfer({
        exp_ts_title: data.exp_ts_title,
        exp_ts_amount: data.exp_ts_amount,
        exp_ts_date: data.exp_ts_date,
        exp_ts_time: data.exp_ts_time,
        exp_ts_note: data.exp_ts_note,
        exp_ts_from_bank_account_id: data.exp_ts_bank_account_id,
        exp_ts_to_bank_account_id: data.exp_ts_to_bank_account_id!,
      })
        .then(() => {
          showToast({
            text1: 'Transfer added successfully',
            type: 'success',
            position: 'bottom',
          });
          router.back();
        })
        .catch((err) => {
          showToast({ text1: getApiErrorMessage(err, 'Server Error'), type: 'error', position: 'bottom' });
        });
      return;
    }

    try {
      const attachmentField = data.exp_ts_attachment_url;
      let finalAttachmentUrl: string | null = null;

      if (attachmentField?.kind === 'local') {
        try {
          const uploaded = await uploadAttachment(
            `data:${attachmentField.mimeType};base64,${attachmentField.base64}`,
          );
          finalAttachmentUrl = uploaded.url;
        } catch (err) {
          console.error('Attachment upload failed', err);
          showToast({
            text1: 'Failed to upload attachment. Please try again.',
            type: 'error',
            position: 'bottom',
          });
          return;
        }
      } else if (attachmentField?.kind === 'remote') {
        finalAttachmentUrl = attachmentField.url;
      }

      const formattedData = {
        ...data,
        exp_ts_amount: data.exp_ts_amount,
        exp_ts_transaction_type: data.exp_tt_id || 1,
        exp_ts_category: data.exp_tc_id,
        exp_ts_attachment_url: finalAttachmentUrl,
      };

      if (exp_ts_id) {
        formattedData.exp_ts_id = exp_ts_id;
      }

      saveTransaction(formattedData)
        .then(() => {
          showToast({
            text1: exp_ts_id
              ? 'Transaction updated successfully'
              : 'Transaction added successfully',
            type: 'success',
            position: 'bottom',
          });
          // Only now that the save has actually succeeded is it safe to delete the
          // previously-persisted attachment (if it was replaced or removed this session) -
          // deleting any earlier would risk orphaning the DB reference if the save failed.
          const previousUrl = existingTransaction?.exp_ts_attachment_url;
          if (previousUrl && previousUrl !== finalAttachmentUrl) {
            deleteAttachment(previousUrl).catch(() => {});
          }
          notifyBudgetThresholdIfCrossed(formattedData.exp_ts_category);
          if (!isBulk) {
            router.back();
          } else {
            const primary = accounts.find((a) => a.exp_ba_is_primary);
            reset(
              {
                exp_ts_title: '',
                exp_ts_date: getValues('exp_ts_date') || format(new Date(), 'yyyy-MM-dd'),
                exp_ts_time: getValues('exp_ts_time'),
                exp_ts_note: '',
                exp_ts_amount: undefined,
                exp_tc_id: undefined,
                exp_tt_id: 1,
                exp_st_id: false,
                exp_ts_bank_account_id: primary?.exp_ba_id || undefined,
                exp_ts_tags: [],
                exp_ts_attachment_url: null,
              },
              {
                keepDirty: false,
                keepIsValidating: true,
              },
            );
          }
        })
        .catch((err) => {
          showToast({
            text1: getApiErrorMessage(err, 'Server Error'),
            type: 'error',
            position: 'bottom',
          });
        });
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const confirm = await new Promise((resolve) =>
        Alert.alert(
          'Delete this transaction?',
          'Are you sure you want to delete this transaction?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
          ],
        ),
      );

      if (!confirm) return;

      if (exp_ts_id)
        deleteTransaction(exp_ts_id)
          .then(() => {
            showToast({
              text1: 'The transaction has been removed.',
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
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const redirectToCategory = () => {
    router.push('/categories');
  };

  const categoriesList = useMemo(
    () => categories.filter((cate) => cate.exp_tc_transaction_type === exp_tt_id) || [],
    [categories, exp_tt_id],
  );

  // Turning an existing expense/income into a transfer mid-edit isn't
  // supported - editTransaction's balance math assumes type 1/2, and a
  // transfer is create-only via its own endpoint. So Transfer is only
  // offered as a type option when adding a brand new transaction.
  const availableTransactionTypes = useMemo(
    () => (exp_ts_id ? TransactionType.filter((t) => t.id !== 3) : TransactionType),
    [exp_ts_id],
  );

  const selectedCategory = () => {
    return categories.find((item) => item.exp_tc_id === exp_tc_id)?.exp_tc_label || '';
  };

  const applyTemplate = (template: ITransactionTemplate) => {
    setValue('exp_ts_title', template.exp_ts_title, { shouldDirty: true, shouldValidate: true });
    setValue('exp_ts_note', template.exp_ts_note ?? '', { shouldDirty: true });
    setValue('exp_ts_amount', template.exp_ts_amount, { shouldDirty: true, shouldValidate: true });
    setValue('exp_tc_id', template.exp_tc_id, { shouldDirty: true, shouldValidate: true });
    setValue('exp_tt_id', template.exp_tt_id, { shouldDirty: true });
    setValue('exp_st_id', template.exp_st_id ?? false, { shouldDirty: true });
    setValue('exp_ts_bank_account_id', template.exp_ts_bank_account_id, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleOpenTemplateModal = () => {
    const values = getValues();
    if (
      !values.exp_ts_title ||
      !values.exp_ts_amount ||
      !values.exp_tc_id ||
      !values.exp_ts_bank_account_id
    ) {
      showToast({
        text1: 'Fill in title, amount, category and account first',
        type: 'error',
        position: 'bottom',
      });
      return;
    }
    setTemplateModalVisible(true);
  };

  const handleSaveTemplate = () => {
    const trimmed = templateName.trim();
    if (!trimmed) return;

    const values = getValues();
    saveTemplate(trimmed, {
      exp_ts_title: values.exp_ts_title || '',
      exp_ts_note: values.exp_ts_note || '',
      exp_ts_amount: values.exp_ts_amount || '',
      exp_tc_id: values.exp_tc_id || '',
      exp_tt_id: values.exp_tt_id || 1,
      exp_st_id: values.exp_st_id || false,
      exp_ts_bank_account_id: values.exp_ts_bank_account_id || '',
    });

    setTemplateName('');
    setTemplateModalVisible(false);
    showToast({ text1: `Template "${trimmed}" saved`, type: 'success', position: 'bottom' });
  };

  const switchType = useCallback(
    (data: number | string) => {
      if (!data) return;

      // A category from the previous type doesn't belong to the new type's
      // list, so it must always be cleared on switch - otherwise it lingers
      // selected but hidden from CategorySelector's filtered options, and
      // blocks the AI suggestion gate (which requires no category chosen).
      setValue('exp_tc_id', '', {
        shouldValidate: true,
        shouldDirty: true,
      });
      setCategorySuggestion(null);
      // A stale "amount exceeds balance" error is specific to the transfer
      // flow (set manually in onSubmit, since it depends on the selected
      // account's balance) - it must not linger once the type changes away
      // from or into Transfer.
      clearErrors('exp_ts_amount');

      if (data === 3) {
        // The account field may already hold an auto-picked primary account
        // from a regular expense/income entry - that's not necessarily the
        // intended "from" account for a transfer, so force an explicit
        // re-selection of both accounts instead of carrying it forward.
        // Not validated eagerly here - errors should only appear after the
        // user attempts to submit, not immediately on switching type.
        setValue('exp_ts_bank_account_id', '');
        setValue('exp_ts_to_bank_account_id', undefined);
      } else {
        setValue('exp_ts_to_bank_account_id', undefined);
      }

      // react-hook-form's reValidateMode only re-checks the specific field
      // that changed, so an already-shown error on an unrelated field (e.g.
      // Title) would otherwise sit stale after switching type until that
      // exact field is touched again. Once the user has attempted a submit,
      // re-run validation across the whole form so every error reflects the
      // current values/type - but don't do this before a submit attempt, or
      // it would bring back eager errors before the user has pressed Add.
      if (isSubmitted) {
        trigger();
      }
    },
    [setValue, clearErrors, isSubmitted, trigger],
  );

  return (
    <SafeAreaViewComponent>
      <View style={{ flex: 1 }}>
        {(isFetching || isDeleting || isSaving) && <OverlayLoader />}
        <ThemedView
          style={{
            flex: 1,
            paddingHorizontal: 5,
          }}>
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
                  <ProfileHeader title={exp_ts_id ? 'Edit transaction' : 'Add transaction'} />
                </View>
              )}
              renderItem={() => {
                if (isExistingTransfer) {
                  return (
                    <Animated.View
                      style={[
                        styles.formContainer,
                        formAnimatedStyle,
                        styles.transferLockedWrapper,
                      ]}>
                      <View style={styles.transferLockedContainer}>
                        <View
                          style={[
                            styles.transferLockedIconBadge,
                            { backgroundColor: `${colors.transfer}1A` },
                          ]}>
                          <MaterialIcons name="swap-horiz" size={32} color={colors.transfer} />
                        </View>
                        <Spacer height={20} />
                        <Text
                          style={[styles.transferLockedTitle, { color: colors.title }]}>
                          Transfers can&apos;t be edited
                        </Text>
                        <Spacer height={8} />
                        <Text
                          style={[
                            styles.subText,
                            styles.transferLockedDescription,
                            { color: colors.lighterTitle },
                          ]}>
                          Delete this transfer and create a new one if you need to change it.
                        </Text>
                      </View>
                    </Animated.View>
                  );
                }

                return (
                  <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
                    <View>
                      <View style={[styles.sectionContainer]}>
                        {!exp_ts_id && templates.length > 0 && (
                          <>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                              {templates.map((t) => (
                                <TemplateChip
                                  key={t.id}
                                  name={t.name}
                                  onPress={() => applyTemplate(t)}
                                  onDelete={() => deleteTemplate(t.id)}
                                />
                              ))}
                            </View>
                            <Spacer height={20} />
                          </>
                        )}
                        <Controller
                          control={control}
                          name="exp_ts_bank_account_id"
                          render={({ field }) => (
                            <CustomSelectInput
                              {...field}
                              value={field.value ?? ''}
                              options={accounts
                                .filter(
                                  (account) => account.exp_ba_id !== exp_ts_to_bank_account_id,
                                )
                                .map((account) => ({
                                  key: account.exp_ba_id,
                                  value: account.exp_ba_name,
                                }))}
                              search={false}
                              placeholder="Select account"
                              label={isTransfer ? 'From Account' : 'Choose Account'}
                              onChange={(selectedId) => {
                                field.onChange(selectedId);
                              }}
                              error={errors.exp_ts_bank_account_id?.message}
                            />
                          )}
                        />

                        {isTransfer && (
                          <>
                            {errors.exp_ts_bank_account_id?.message ? <Spacer height={14} /> : null}
                            <View style={styles.transferArrowContainer}>
                              <View
                                style={[
                                  styles.transferArrowBadge,
                                  { backgroundColor: colors.transfer },
                                ]}>
                                <MaterialIcons
                                  name="arrow-downward"
                                  size={18}
                                  color={colors.onPrimary}
                                />
                              </View>
                            </View>
                            <Controller
                              control={control}
                              name="exp_ts_to_bank_account_id"
                              render={({ field }) => (
                                <CustomSelectInput
                                  {...field}
                                  value={field.value ?? ''}
                                  options={accounts
                                    .filter(
                                      (account) => account.exp_ba_id !== exp_ts_bank_account_id,
                                    )
                                    .map((account) => ({
                                      key: account.exp_ba_id,
                                      value: account.exp_ba_name,
                                    }))}
                                  search={false}
                                  placeholder="Select destination account"
                                  label="To Account"
                                  onChange={(selectedId) => {
                                    field.onChange(selectedId);
                                  }}
                                  error={errors.exp_ts_to_bank_account_id?.message}
                                />
                              )}
                            />
                          </>
                        )}

                        <Spacer height={30} />
                        <View
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            columnGap: 10,
                          }}>
                          <Controller
                            control={control}
                            render={({ field }) => (
                              <DatePickerPaper
                                {...field}
                                onBlur={field.onBlur}
                                onChange={(data) => field.onChange(data)}
                                value={field.value}
                                placeholder="Select Date"
                                error={errors.exp_ts_date?.message}
                                isRequired
                              />
                            )}
                            name="exp_ts_date"
                          />
                          <Controller
                            control={control}
                            render={({ field }) => (
                              <TimePickerPaper
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                placeholder="Select time"
                                error={errors.exp_ts_time?.message}
                                isRequired
                              />
                            )}
                            name="exp_ts_time"
                          />
                        </View>
                        <Spacer height={Spacing.xl} />
                        <Controller
                          control={control}
                          render={({ field }) => (
                            <CustomRadioButton
                              label="Transaction Type"
                              value={field.value}
                              options={availableTransactionTypes}
                              onChange={(data) => {
                                field.onChange(data);
                                switchType(data);
                              }}
                              disabled={field.disabled}
                              isRequired
                            />
                          )}
                          name="exp_tt_id"
                        />
                        {errors.exp_tt_id?.message ? (
                          <Text style={[styles.errorMessage, { color: colors.expense }]}>
                            {errors.exp_tt_id?.message}
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
                              error={errors.exp_ts_amount?.message}
                              borderLess
                              isRequired
                            />
                          )}
                          name="exp_ts_amount"
                        />
                        <Spacer height={30} />
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
                              error={errors.exp_ts_title?.message}
                              borderLess
                              isRequired
                            />
                          )}
                          name="exp_ts_title"
                        />
                      </View>
                      <Spacer height={Spacing.lg} />
                      {!isTransfer && (
                        <View style={[styles.sectionContainer]}>
                          <View
                            style={{
                              borderColor: errors.exp_tc_id?.message
                                ? colors.expense
                                : colors.inputBorder,
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
                                {!!selectedCategory() && (
                                  <Text
                                    style={{
                                      fontFamily: 'Inter-500',
                                      color: colors.text,
                                    }}>
                                    {' '}
                                    : {selectedCategory()}
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

                            {!!categorySuggestion && !exp_tc_id && (
                              <View style={{ paddingHorizontal: 5, paddingBottom: 10 }}>
                                <CategorySuggestionChip
                                  label={categorySuggestion.label}
                                  icon={categorySuggestion.icon}
                                  iconBgColor={categorySuggestion.iconBgColor}
                                  onPress={() => {
                                    setValue('exp_tc_id', categorySuggestion.id, {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    });
                                    setCategorySuggestion(null);
                                  }}
                                  onDismiss={() => {
                                    setCategorySuggestion(null);
                                    setSuggestionsDisabled(true);
                                  }}
                                />
                              </View>
                            )}

                            <CategorySelector
                              categories={categoriesList}
                              selected={exp_tc_id}
                              onSelect={(id) =>
                                setValue('exp_tc_id', id, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                              }
                            />
                          </View>

                          {errors.exp_tc_id?.message ? (
                            <Text style={[styles.errorMessage, { color: colors.expense }]}>
                              {errors.exp_tc_id?.message}
                            </Text>
                          ) : null}
                        </View>
                      )}
                      {!isTransfer && (
                        <>
                          <Spacer height={Spacing.md} />
                          <Controller
                            control={control}
                            render={({ field }) => (
                              <AttachmentPicker
                                value={field.value ?? null}
                                onChange={field.onChange}
                              />
                            )}
                            name="exp_ts_attachment_url"
                          />
                        </>
                      )}
                      <Spacer height={Spacing.md} />
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
                            error={errors.exp_ts_note?.message}
                            borderLess
                            multiline={true}
                            numberOfLines={4}
                            isTextBox
                          />
                        )}
                        name="exp_ts_note"
                      />
                      {!isTransfer && (
                        <>
                          <Spacer height={Spacing.md} />
                          <Controller
                            control={control}
                            render={({ field }) => (
                              <TagInput
                                value={field.value ?? []}
                                onChange={field.onChange}
                                label="Tags"
                              />
                            )}
                            name="exp_ts_tags"
                          />
                        </>
                      )}
                      <View style={styles.subTextContainer}>
                        {!!existingTransaction?.exp_ts_created_at && (
                          <Text style={[styles.subText, { color: colors.lighterTitle }]}>
                            Created:{' '}
                            {format(existingTransaction.exp_ts_created_at, 'do MMMM yyyy HH:mm')}
                          </Text>
                        )}
                        {!!existingTransaction?.exp_ts_updated_at && (
                          <Text style={[styles.subText, { color: colors.lighterTitle }]}>
                            Modified:{' '}
                            {format(existingTransaction.exp_ts_updated_at, 'do MMMM yyyy HH:mm')}
                          </Text>
                        )}
                      </View>
                      <Spacer height={70} />
                    </View>
                  </Animated.View>
                );
              }}
              keyExtractor={() => 'form-transaction'}
            />
          </KeyboardAvoidingView>
        </ThemedView>
        <View style={[styles.footer, { backgroundColor: colors.bottomBarBackground }]}>
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 40,
              }}>
              {!isTransfer && (
                <TouchableOpacity
                  onPress={() => {
                    setValue('exp_st_id', !exp_st_id, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}>
                  <MaterialIcons
                    name={exp_st_id ? 'star' : 'star-border'}
                    size={20}
                    color={colors.favorite}
                  />
                </TouchableOpacity>
              )}

              {!exp_ts_id && !isTransfer && (
                <TouchableOpacity onPress={handleOpenTemplateModal}>
                  <MaterialIcons name="bookmark-add" size={20} color={colors.text} />
                </TouchableOpacity>
              )}

              {exp_ts_id ? (
                <>
                  <TouchableOpacity onPress={handleDelete} disabled={isLoading}>
                    <FontAwesome5 name="trash" size={20} color={colors.text} />
                  </TouchableOpacity>
                </>
              ) : (
                !isTransfer && (
                  <View
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexDirection: 'row',
                      gap: 2,
                    }}>
                    <Text style={[styles.subText, { color: colors.title }]}>Bulk Add</Text>
                    <CustomSwitch
                      value={isBulk}
                      onChange={(value) => {
                        setIsBulk(value);
                      }}
                    />
                  </View>
                )
              )}
            </View>
          </View>

          {!isExistingTransfer && (
            <View>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colors.primary },
                  !isDirty || isFetching || isDeleting || isSaving ? styles.disable : {},
                ]}
                disabled={!isDirty || isFetching || isDeleting || isSaving}
                onPress={handleSubmit(onSubmit)}>
                {isSaving ? (
                  <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
                ) : null}
                <Text
                  style={[
                    styles.title,
                    { color: colors.onPrimary },
                    isSaving ? styles.textDisable : {},
                  ]}>
                  {exp_ts_id ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <ModalCard
          visible={templateModalVisible}
          onClose={() => setTemplateModalVisible(false)}
          title="Save as Template">
          <Input
            value={templateName}
            onChangeText={setTemplateName}
            placeholder="e.g. Morning Coffee"
            label="Template name"
            borderLess
          />
          <Spacer height={20} />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSaveTemplate}>
            <Text style={[styles.title, { color: colors.onPrimary }]}>Save</Text>
          </TouchableOpacity>
        </ModalCard>
      </View>
    </SafeAreaViewComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    columnGap: 10,
    flexDirection: 'row',
  },
  formContainer: {
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  sectionContainer: {
    marginVertical: 10,
  },
  transferLockedWrapper: {
    minHeight: '75%',
    justifyContent: 'center',
  },
  transferLockedContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  transferLockedIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transferLockedTitle: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-600',
    textAlign: 'center',
  },
  transferLockedDescription: {
    textAlign: 'center',
    maxWidth: 260,
  },
  transferArrowContainer: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transferArrowBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
    // color applied inline via colors.onPrimary at usage site (button sits on colors.primary)
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
    // height: 50,
    // backgroundColor supplied via colors.barBackground where this style is used
    elevation: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
  },
  subText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
  },
  subTextContainer: {
    paddingTop: 30,
    paddingLeft: 10,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 8,
  },
  categoryLabel: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-500',
  },
});
