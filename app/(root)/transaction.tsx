import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';

import Input from '@/components/Input';
import Spacer from '@/components/Spacer';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import CustomRadioButton from '@/components/CustomRadioButton';
import CustomDatePicker from '@/components/CustomDatePicker';

import { transactionSchema, transactionSchemaType } from '@/utils/schema';
import { TransactionType } from '@/utils/common-data';
import { useGetCategoryCache } from '@/hooks/useCategoryListOperation';
import CustomTimePicker from '@/components/TimePicker';
import { AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import OverlayLoader from '@/components/Overlay';
import {
  useDeleteTransaction,
  useFetchTransaction,
  useSaveTransaction,
} from '@/hooks/useTransaction';
import { showToast } from '@/components/ToastMessage';
import ProfileHeader from '@/components/ProfileHeader';
import CategorySelector from '@/components/CategorySelector';
import DatePickerPaper from '@/components/DatePickerPaper';
import TimePickerPaper from '@/components/TimePickerPaper';

export default function Transaction() {
  const { categories } = useGetCategoryCache();
  const { exp_ts_id, starred } = useLocalSearchParams() as {
    exp_ts_id?: string;
    starred?: boolean;
  };
  const { data, isLoading: isFetching } = useFetchTransaction(exp_ts_id);
  const { mutateAsync: saveTransaction, isPending: isLoading } = useSaveTransaction(starred);
  const { mutateAsync: deleteTransaction, isPending: isDeleting } = useDeleteTransaction();

  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      exp_ts_title: '',
      exp_ts_date: '',
      exp_ts_note: '',
      exp_ts_time: '',
      exp_ts_amount: undefined,
      exp_tc_id: undefined,
      exp_tt_id: 1,
      exp_st_id: false,
    },
    resolver: zodResolver(transactionSchema),
  });
  const exp_st_id = watch('exp_st_id');
  const exp_tc_id = watch('exp_tc_id');
  const exp_tt_id = watch('exp_tt_id');

  useEffect(() => {
    if (data) {
      reset(
        {
          exp_ts_title: data.exp_ts_title || '',
          exp_ts_date: data.exp_ts_date || '',
          exp_ts_note: data.exp_ts_note || '',
          exp_ts_time: data.exp_ts_time || '',
          exp_ts_amount: data.exp_ts_amount?.toString() || '',
          exp_tc_id: data.exp_tc_id,
          exp_tt_id: data.exp_tt_id || 1,
          exp_st_id: !!data.exp_st_id,
        },
        {
          keepDirty: false,
          keepIsValidating: true,
        },
      );
    }
  }, [data, reset]);

  const onSubmit = (data: transactionSchemaType & { exp_ts_id?: string }) => {
    try {
      const formattedData = {
        ...data,
        exp_ts_amount: data.exp_ts_amount,
        exp_ts_transaction_type: data.exp_tt_id || 1,
        exp_ts_category: data.exp_tc_id,
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
          router.back();
        })
        .catch(() => {
          showToast({
            text1: 'Server Error',
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
        deleteTransaction(Number(exp_ts_id))
          .then(() => {
            showToast({
              text1: 'Transaction removed successfully',
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

  const selectedCategory = () => {
    return categories.find((item) => item.exp_tc_id === exp_tc_id)?.exp_tc_label || '';
  };

  const switchType = useCallback(
    (data: number | string) => {
      if (!data || !exp_ts_id) return;

      const filtered = categories.filter((item) => item.exp_tc_transaction_type === data);

      const othersCategory = filtered.find((item) => item.exp_tc_label.toLowerCase() === 'others');

      if (othersCategory) {
        setValue('exp_tc_id', othersCategory.exp_tc_id, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    },
    [exp_ts_id, categories, setValue],
  );

  return (
    <KeyboardAvoidingView
      {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
      style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <View style={{ flex: 1 }}>
          {(isFetching || isDeleting || isLoading) && <OverlayLoader />}
          <ThemedView
            style={{
              flex: 1,
              paddingHorizontal: 5,
            }}>
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
                return (
                  <View style={styles.formContainer}>
                    <View>
                      <View style={[styles.sectionContainer]}>
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
                        <Spacer height={10} />
                        <Controller
                          control={control}
                          render={({ field }) => (
                            <CustomRadioButton
                              label="Transaction Type"
                              value={field.value}
                              options={TransactionType}
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
                          <Text style={styles.errorMessage}>{errors.exp_tt_id?.message}</Text>
                        ) : null}
                        <Spacer height={20} />

                        <Controller
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="amount"
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
                        <Spacer height={20} />
                        <Controller
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              placeholder="title"
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
                      <View style={[styles.sectionContainer]}>
                        <View
                          style={{
                            borderColor: '#5a4f96',
                            borderWidth: 1,
                            borderRadius: 8,
                            paddingVertical: 5,
                            paddingHorizontal: 8,
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
                                { flex: 1, flexWrap: 'wrap', lineHeight: 20 },
                              ]}>
                              Category
                              {!!selectedCategory() &&
                              <Text
                                style={{
                                  fontFamily: 'Inter-500',
                                  color: '#FFF',
                                }}>
                                {' '}:{' '}{selectedCategory()}
                              </Text>}
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
                                <MaterialIcons name="edit" size={22} color="#fff" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                activeOpacity={0.2}
                                style={{
                                  paddingHorizontal: 10,
                                }}
                                onPress={redirectToCategory}>
                                <MaterialIcons name="add" size={22} color="#fff" />
                              </TouchableOpacity>
                            </View>
                          </View>

                          <CategorySelector
                            categories={categoriesList}
                            selected={exp_tc_id}
                            setValue={setValue}
                          />
                        </View>

                        {errors.exp_tc_id?.message ? (
                          <Text style={styles.errorMessage}>{errors.exp_tc_id?.message}</Text>
                        ) : null}
                      </View>
                      <Spacer height={12} />
                      <Controller
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            value={field.value ?? ''}
                            placeholder="notes"
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
                      <View style={styles.subTextContainer}>
                        {!!data?.exp_ts_created_at && (
                          <Text style={styles.subText}>
                            Created:{' '}
                            {format(new Date(data.exp_ts_created_at), 'do MMMM yyyy HH:MM a')}
                          </Text>
                        )}
                        {!!data?.exp_ts_updated_at && (
                          <Text style={styles.subText}>
                            Modified:{' '}
                            {format(new Date(data.exp_ts_updated_at), 'do MMMM yyyy HH:MM a')}
                          </Text>
                        )}
                      </View>
                      <Spacer height={70} />
                    </View>
                  </View>
                );
              }}
              keyExtractor={() => 'form-transaction'}
            />
          </ThemedView>
          <View style={styles.footer}>
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 40,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    setValue('exp_st_id', !exp_st_id, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}>
                  <AntDesign name={exp_st_id ? 'star' : 'staro'} size={20} color="#FFF" />
                </TouchableOpacity>

                {exp_ts_id && (
                  <>
                    <TouchableOpacity onPress={handleDelete}>
                      {isLoading ? (
                        <ActivityIndicator animating color={'#6900FF'} style={styles.loader} />
                      ) : null}
                      <FontAwesome5 name="trash" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            <View>
              <TouchableOpacity
                style={[
                  styles.button,
                  !isValid || !isDirty || isFetching || isDeleting || isLoading
                    ? styles.disable
                    : {},
                ]}
                disabled={!isValid || !isDirty || isFetching || isDeleting || isLoading}
                onPress={handleSubmit(onSubmit)}>
                {isLoading ? (
                  <ActivityIndicator animating color={'#1C1C29'} style={styles.loader} />
                ) : null}
                <Text style={[styles.title, isLoading ? styles.textDisable : {}]}>
                  {exp_ts_id ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaViewComponent>
    </KeyboardAvoidingView>
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
  title: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter-600',
  },
  disable: {
    opacity: 0.5,
  },
  textDisable: { opacity: 0 },
  errorContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    display: 'flex',
    width: '100%',
    paddingTop: 20,
    paddingBottom: 10,
  },
  error: {
    fontSize: 14,
    color: '#f02d3a',
    fontFamily: 'Inter-500',
    letterSpacing: 0.5,
  },
  errorMessage: {
    fontSize: 12,
    color: '#f02d3a',
    fontFamily: 'Inter-300',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 18,
    color: '#FFF',
    fontFamily: 'Inter-600',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#b7b6c1',
    marginBottom: 2,
    fontFamily: 'Inter-700',
    textDecorationLine: 'underline',
  },
  sectionTitleContainer: {
    marginBottom: 10,
  },
  interest: {
    backgroundColor: '#323448',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 6,
    color: '#c7c7c7',
    fontFamily: 'Inter-600',
    textAlign: 'center',
  },
  footer: {
    // height: 50,
    elevation: 10,
    backgroundColor: '#1A1A24',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  footerText: {
    color: '#fff',
    fontSize: 18,
  },
  subText: {
    color: '#8880A0',
    fontSize: 12,
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
    fontSize: 14,
    color: '#CCC',
    fontFamily: 'Inter-500',
  },
});
