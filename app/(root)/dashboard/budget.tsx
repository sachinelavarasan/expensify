import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import MonthSwitcher from '@/components/MonthSwitch';
import useBudgetsForMonth from '@/hooks/useBudget';
import BudgetTable from '@/components/BudgetTable';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useThemeContext } from '@/contexts/ThemedContext';
import { deviceHeight, deviceWidth } from '@/utils/functions';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { formatToCurrency } from '@/utils/formatter';
import ReactNativeModal from 'react-native-modal';
import Spacer from '@/components/Spacer';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/Input';
import { showToast } from '@/components/ToastMessage';
import { useAddBudget, useDeleteBudget, useUpdateBudget } from '@/hooks/useBudgetOperation';
import { IBudget } from '@/types';
import { BudgetedCategoriesList } from '@/components/CollapsibleCategoryCard';
import OverlayLoader from '@/components/Overlay';

const width = deviceWidth();
const height = deviceHeight();
const barWidth = Math.round((width - 30) * 0.7);

const schema = z.object({
  exp_bg_amount: z
    .string()
    .nonempty({ message: 'Amount is required' })
    .refine((val) => /^(\d+)(\.\d{1,3})?$/.test(val), {
      message: 'Please enter a valid amount',
    }),
});

type BudgetSchema = z.infer<typeof schema>;

function BudgetProgressBar({
  spentAmount,
  budgetAmount,
  exceeded,
}: {
  spentAmount: number;
  budgetAmount: number;
  exceeded: boolean;
}) {
  const percentage = Math.min((spentAmount / budgetAmount) * 100, 100);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(percentage, { duration: 800 });
  }, [percentage, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View>
      <View
        style={{
          height: 18,
          backgroundColor: '#6e6c706c',
          borderRadius: 9,
          overflow: 'hidden',
          marginTop: 6,
          width: barWidth,
        }}>
        <Animated.View
          style={[
            {
              height: '100%',
              backgroundColor: exceeded ? '#d12222' : '#6C63FF',
              borderRadius: 0,
            },
            animatedStyle,
          ]}
        />
      </View>
      <Text
        style={[
          styles.amount,
          {
            color: '#999999',
            marginTop: 6,
            fontFamily: 'Inter-500',
            fontSize: 12,
          },
        ]}>
        {exceeded ? 'Budget Exceeded' : `${percentage.toFixed(2)}% used`}
      </Text>
    </View>
  );
}

const Budget = () => {
  const [show, setShow] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<IBudget | null>(null);
  const { colors, theme } = useThemeContext();
  const { budgets, currentMonth, loading, currentDate,  goToPreviousMonth, goToNextMonth, refetch } =
    useBudgetsForMonth();
  const { mutateAsync: addBudget, isPending: isLoading } = useAddBudget();
  const { mutateAsync: editBudget, isPending: isUpdating } = useUpdateBudget();
  const { mutateAsync: deleteBudget, isPending: isDeleting } = useDeleteBudget();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    defaultValues: {
      exp_bg_amount: '',
    },
    resolver: zodResolver(schema),
  });

  const toggleModal = (data: IBudget | null = null) => {
    if (data === null) {
      setShow(!show);
      reset();
      setTimeout(() => {
        setCurrentBudget(null);
      }, 100);
    } else {
      setShow(!show);
      setCurrentBudget(data);
      reset(
        {
          exp_bg_amount: data && Number(data.budgetAmount) > 0 ? String(data.budgetAmount) : '',
        },
        {
          keepDirty: false,
          keepIsValidating: true,
        },
      );
    }
  };
  const nonBudgetedCategories = budgets.filter((item) => !item.exp_bg_id);
  const budgetedCategories = budgets.filter((item) => item.exp_bg_id);
  const totalSpent = budgetedCategories.reduce((acc, item) => acc + item.totalAmount, 0);
  const totalBudget = budgetedCategories.reduce((acc, item) => acc + Number(item.budgetAmount), 0);
  const totalRemaining = budgetedCategories.reduce((acc, item) => acc + item.remainingBudget, 0);

  const handlePress = (data: BudgetSchema) => {
    if (!currentBudget) {
      return;
    }
    if (currentBudget.exp_bg_id) {
      const body = {
        ...data,
        exp_bg_id: currentBudget.exp_bg_id,
      };
      editBudget({ ...body })
        .then(() => {
          showToast({
            text1: 'Budget updated successfully',
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
          refetch();
        });
    } else {
      const body = {
        ...data,
        exp_bg_category_id: currentBudget.categoryId,
      };
      addBudget({ ...body, exp_bg_date: currentDate.toISOString() })
        .then(() => {
          showToast({
            text1: 'New Budget added successfully',
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
          refetch();
        });
    }
  };

  const handleDelete = () => {
    if (!currentBudget?.exp_bg_id) {
      return;
    }
    deleteBudget(currentBudget.exp_bg_id)
      .then(() => {
        showToast({
          text1: 'Budget deleted successfully',
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
        refetch();
      });
  };

  return (
    <ThemedView style={{ flex: 1, paddingHorizontal: 15 }}>
      {loading && <OverlayLoader />}
        <FlatList
          data={[1]}
          bounces={false}
          keyExtractor={() => 'page-wrapper'}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
          renderItem={null as any}
          ListHeaderComponent={
            <>
              <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                <MonthSwitcher
                  nextMonth={goToNextMonth}
                  prevMonth={goToPreviousMonth}
                  currentMonth={currentMonth}
                />
              </View>

              {budgetedCategories.length > 0 ? (
                <>
                  <BudgetTable
                    totalSpent={totalSpent}
                    totalBudget={totalBudget}
                    totalRemaining={totalRemaining}
                  />

                  <View style={{ paddingBottom: 10, alignItems: 'center' }}>
                    <BudgetProgressBar
                      spentAmount={totalSpent}
                      budgetAmount={totalBudget}
                      exceeded={totalRemaining < 0}
                    />
                  </View>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                    <Text style={[styles.dateHeader, { color: colors.lighterTitle }]}>
                      Budgeted Categories
                    </Text>
                    <BudgetedCategoriesList
                      budgetedCategories={budgetedCategories}
                      colors={colors}
                      formatToCurrency={formatToCurrency}
                      openModal={toggleModal}
                      currentMonth={currentMonth}
                    />
                  </View>
                </>
              ) : (
                <View style={{ alignItems: 'center', marginVertical: 10 }}>
                  <Ionicons name="wallet-outline" size={60} color="#ccc" />
                  <Text style={[styles.dateHeader, { color: colors.lighterTitle, marginTop: 4 }]}>
                    Budget not set for this month
                  </Text>
                </View>
              )}

              {nonBudgetedCategories.length > 0 && (
                <View style={{ paddingHorizontal: 10, marginTop: 10 }}>
                  <Text style={[styles.dateHeader, { color: colors.lighterTitle }]}>
                    Not Budgeted Categories
                  </Text>
                  
                  {nonBudgetedCategories.map((category) => (
                    <View style={styles.subMenuContainer} key={category.category}>
                      <View style={styles.card}>
                        <View style={styles.left}>
                          <View
                            style={{
                              backgroundColor: category.iconBg ? category.iconBg : '#282343',
                              padding: 5,
                              borderRadius: 5,
                            }}>
                            <MaterialIcons
                              name={
                                category.icon as React.ComponentProps<typeof MaterialIcons>['name']
                              }
                              size={24}
                              color="#e0deed"
                            />
                          </View>
                          <View>
                            <Text
                              style={[
                                styles.cardTitle,
                                { color: colors.title, flex: 1, flexWrap: 'wrap' },
                              ]}>
                              {category.category}
                            </Text>
                            <View
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                              }}>
                              <Text style={[styles.subText, { color: colors.description }]}>
                                Spent :
                              </Text>
                              <Text
                                style={[
                                  styles.subText,
                                  { color: colors.title, fontFamily: 'Inter-600' },
                                ]}>
                                {formatToCurrency(category.totalAmount)}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View>
                          <TouchableOpacity
                            style={[
                              styles.buttonRounded,
                              {
                                borderColor: colors.secondary,
                              },
                            ]}
                            onPress={() => {
                              toggleModal(category);
                            }}>
                            <Text
                              style={[
                                styles.cardTitle,
                                {
                                  color: colors.secondary,
                                  fontSize: 16,
                                  fontFamily: 'Inter-600',
                                },
                              ]}>
                              SET LIMIT
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          }
        />
        <ReactNativeModal
          backdropColor={theme === 'light' ? 'rgba(53, 50, 50, 0.5)' : 'rgba(139, 131, 131, 0.2)'}
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
                <Text style={[styles.modalTitle, { color: colors.title }]}>
                  {currentBudget?.exp_bg_id ? 'Edit Budget' : 'Set Budget'}
                </Text>

                <TouchableOpacity onPress={() => toggleModal()}>
                  <Ionicons name="close" color="#5a4f96" size={20} />
                </TouchableOpacity>
              </View>

              <Spacer height={20} />
              <Controller
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Budget"
                    keyboardType="numeric"
                    placeholder="amount"
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    error={errors.exp_bg_amount?.message}
                    borderLess
                    // editable={!exp_ba_id}
                    isRequired
                  />
                )}
                name="exp_bg_amount"
              />
              <Spacer height={30} />
              <View style={{ flexDirection: 'row', gap: 20, justifyContent: 'center' }}>
                {currentBudget?.exp_bg_id ? (
                  <TouchableOpacity
                    style={[styles.budgetButton, { backgroundColor: '#d12222' }]}
                    onPress={handleDelete}
                    disabled={isLoading || isUpdating || isDeleting}>
                    {isLoading || isDeleting ? (
                      <ActivityIndicator animating color={'#FFFFFF'} style={styles.loader} />
                    ) : null}
                    <Text style={[styles.btntitle, isLoading || isDeleting ? styles.disable : {}]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={[
                    styles.budgetButton,
                    !isDirty || isLoading || isUpdating ? styles.disable : {},
                  ]}
                  onPress={handleSubmit(handlePress)}
                  disabled={!isDirty || isLoading || isUpdating || isDeleting}>
                  {isLoading || isUpdating ? (
                    <ActivityIndicator animating color={'#FFFFFF'} style={styles.loader} />
                  ) : null}
                  <Text style={[styles.btntitle, isLoading || isUpdating ? styles.disable : {}]}>
                    {currentBudget?.exp_bg_id ? 'Update' : 'Create'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Spacer height={20} />
            </View>
          </View>
        </ReactNativeModal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  amount: {
    fontSize: 12,
    fontFamily: 'Inter-400',
    textAlign: 'center',
  },
  dateHeader: {
    fontSize: 14,
    fontFamily: 'Inter-500',
    color: '#a19bca',
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    maxWidth: deviceWidth() * 0.5,
  },
  cardTitle: {
    color: '#F1F1F6',
    fontSize: 16,
    fontFamily: 'Inter-600',
  },
  subMenuContainer: {
    // paddingVertical: 4,
  },
  subText: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 2,
  },
  card: {
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonRounded: {
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 8,
    width: 'auto',
  },
  modal: {
    width: deviceWidth() - 60,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-600',
  },
  budgetButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#6B5DE6',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  disable: {
    opacity: 0.6,
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
});

export default Budget;
