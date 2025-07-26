import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Input from '@/components/Input';
import Spacer from '@/components/Spacer';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import CustomRadioButton from '@/components/CustomRadioButton';
import { CustomSelectInput } from '@/components/CustomSelectInput';
import CustomDatePicker from '@/components/CustomDatePicker';

import { transactionSchema, transactionSchemaType } from '@/utils/schema';
import { TransactionType } from '@/utils/common-data';
import useCategoryList from '@/hooks/useCategoryList';
import CustomTimePicker from '@/components/TimePicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FontAwesome5 } from '@expo/vector-icons';
import OverlayLoader from '@/components/Overlay';
import { useSaveTransaction } from '@/hooks/useSaveTransaction';
import { Itransaction } from '@/types';
import { useAuth } from '@clerk/clerk-expo';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Transaction() {
  const { categories, loading } = useCategoryList();
  const { exp_ts_id } = useLocalSearchParams<{ exp_ts_id?: string }>();
  const router = useRouter();
  const { getToken } = useAuth();

  const formattedCategory = useMemo(() => {
    return categories.map((category) => ({
      key: category.exp_tc_id,
      value: category.exp_tc_label,
    }));
  }, [categories]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    defaultValues: {
      exp_ts_title: '',
      exp_ts_date: '',
      exp_ts_note: '',
      exp_ts_time: '',
      exp_ts_amount: undefined,
      exp_tc_id: undefined,
      exp_tt_id: undefined,
    },
    resolver: zodResolver(transactionSchema),
  });

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!exp_ts_id) return;

      try {
        const token = await getToken();
        const response = await fetch(`${API_URL}/expensify/transaction/${exp_ts_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch transaction: ${response.status}`);
        }

        const data = await response.json();

        reset({
          exp_ts_title: data.exp_ts_title || '',
          exp_ts_date: data.exp_ts_date || '',
          exp_ts_note: data.exp_ts_note || '',
          exp_ts_time: data.exp_ts_time || '',
          exp_ts_amount: data.exp_ts_amount?.toString() || '',
          exp_tc_id: data.exp_tc_id,
          exp_tt_id: data.exp_tt_id,
        });
      } catch (error) {
        console.error('Failed to fetch transaction:', error);
      }
    };

    fetchTransaction();
  }, [exp_ts_id]);

  const { mutateAsync: saveTransaction, isPending: isLoading } = useSaveTransaction();

  const onSubmit = async (data: transactionSchemaType & { exp_ts_id?: string }) => {
    try {
      const formattedData = {
        ...data,
        exp_ts_amount: data.exp_ts_amount,
        exp_ts_transaction_type: data.exp_tt_id,
        exp_ts_category: data.exp_tc_id,
      };

      if (exp_ts_id) {
        formattedData.exp_ts_id = exp_ts_id;
      }

      await saveTransaction(formattedData);

      router.back();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const confirm = await new Promise((resolve) =>
        Alert.alert(
          'Confirm Delete',
          'Are you sure you want to delete this transaction?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
          ],
          { cancelable: true },
        ),
      );

      if (!confirm) return;

      // setIsLoading(true);
      // const currentUser = auth().currentUser;
      // if (!currentUser || !ts_id) throw new Error('Missing user or transaction ID');

      // await firestore().collection(`users/${currentUser.uid}/transactions`).doc(ts_id).delete();

      // setIsLoading(false);
      router.back(); // navigate to previous screen
    } catch (error) {
      // setIsLoading(false);
      console.error('Error deleting transaction:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
      style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          <ThemedView
            style={{
              flex: 1,
              paddingHorizontal: 5,
            }}>
            {loading && <OverlayLoader />}
            <View style={styles.formContainer}>
              {/* {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.error}>{error}</Text>
                </View>
              )} */}
              <View style={[styles.header, { justifyContent: 'space-between' }]}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Pressable
                    onPress={() => {
                      router.back();
                    }}>
                    <Ionicons name="arrow-back" size={20} color="#FFF" />
                  </Pressable>
                  <Text style={styles.label}>
                    {' '}
                    {exp_ts_id ? 'Edit transaction' : 'Add transaction'}
                  </Text>
                </View>
                {exp_ts_id && (
                  <>
                    <TouchableOpacity onPress={handleDelete}>
                      {isLoading ? (
                        <ActivityIndicator animating color={'#6900FF'} style={styles.loader} />
                      ) : null}
                      <FontAwesome5 name="trash" size={20} color="#D9363E" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
              <Spacer height={10} />
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
                        <CustomDatePicker
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
                        <CustomTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          placeholder="Select time"
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
                <View style={[styles.sectionContainer, { marginTop: 25 }]}>
                  <Controller
                    control={control}
                    render={({ field }) => (
                      <CustomSelectInput
                        placeholder="Choose category"
                        value={field.value}
                        label="Category"
                        onChange={(data) => {
                          field.onChange(data);
                        }}
                        options={formattedCategory}
                        isRequired
                      />
                    )}
                    name="exp_tc_id"
                  />
                  {errors.exp_tc_id?.message ? (
                    <Text style={styles.errorMessage}>{errors.exp_tc_id?.message}</Text>
                  ) : null}
                </View>
                <Spacer height={25} />
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
                <Spacer height={35} />
                <View style={styles.btnContainer}>
                  <TouchableOpacity
                    style={[styles.button, !isValid || isLoading ? styles.disable : {}]}
                    disabled={!isValid || isLoading}
                    onPress={handleSubmit(onSubmit)}>
                    {isLoading ? (
                      <ActivityIndicator animating color={'#1C1C29'} style={styles.loader} />
                    ) : null}
                    <Text style={[styles.title, isLoading ? styles.textDisable : {}]}>
                      {exp_ts_id ? 'Update' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Spacer height={50} />
              </View>
            </View>
          </ThemedView>
        </ScrollView>
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
    marginTop: 10,
  },
  sectionContainer: {
    marginVertical: 10,
  },
  btnContainer: {
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#463e75',
    borderRadius: 8,
    paddingVertical: Platform.OS === 'android' ? 12 : 16,
    width: '100%',
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
});
