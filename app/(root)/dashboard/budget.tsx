import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
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
import Emptystate from '@/components/Emptystate';
import { useFocusEffect } from 'expo-router';
import { Spacing } from '@/utils/Spacing';
import { FontSize } from '@/utils/Typography';

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

function FadeInView({ children }: { children: React.ReactNode }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withTiming(0, { duration: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

function BudgetProgressBar({
  spentAmount,
  budgetAmount,
  exceeded,
}: {
  spentAmount: number;
  budgetAmount: number;
  exceeded: boolean;
}) {
  const { colors } = useThemeContext();
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
          backgroundColor: colors.barBackground,
          borderRadius: 9,
          overflow: 'hidden',
          marginTop: 6,
          width: barWidth,
        }}>
        <Animated.View
          style={[
            {
              height: '100%',
              backgroundColor: exceeded ? colors.expense : colors.primary,
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
            color: colors.lighterTitle,
            marginTop: 6,
            fontFamily: 'Inter-500',
            fontSize: FontSize.sm,
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
  const { colors } = useThemeContext();
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
                <Emptystate
                  title="No budget set"
                  description="Set a budget for this month to start tracking your spending."
                />
              )}

              {nonBudgetedCategories.length > 0 && (
                <View style={{ paddingHorizontal: 10, marginTop: 10 }}>
                  <Text style={[styles.dateHeader, { color: colors.lighterTitle }]}>
                    Not Budgeted Categories
                  </Text>
                  
                  {nonBudgetedCategories.map((category) => (
                    <FadeInView key={category.category}>
                    <View style={styles.subMenuContainer}>
                      <View style={styles.card}>
                        <View style={styles.left}>
                          <View
                            style={{
                              backgroundColor: category.iconBg
                                ? category.iconBg
                                : colors.categoryFallbackBg,
                              padding: 5,
                              borderRadius: 5,
                            }}>
                            <MaterialIcons
                              name={
                                category.icon as React.ComponentProps<typeof MaterialIcons>['name']
                              }
                              size={24}
                              color={colors.categoryFallbackIcon}
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
                                gap: Spacing.sm,
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
                                  fontSize: FontSize.base,
                                  fontFamily: 'Inter-600',
                                },
                              ]}>
                              SET LIMIT
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    </FadeInView>
                  ))}
                </View>
              )}
            </>
          }
        />
        <ReactNativeModal
          backdropColor={colors.scrim}
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
                  <Ionicons name="close" color={colors.primary} size={20} />
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
              <View style={{ flexDirection: 'row', gap: Spacing.xl, justifyContent: 'center' }}>
                {currentBudget?.exp_bg_id ? (
                  <TouchableOpacity
                    style={[styles.budgetButton, { backgroundColor: colors.expense }]}
                    onPress={handleDelete}
                    disabled={isLoading || isUpdating || isDeleting}>
                    {isLoading || isDeleting ? (
                      <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
                    ) : null}
                    <Text
                      style={[
                        styles.btntitle,
                        { color: colors.onPrimary },
                        isLoading || isDeleting ? styles.disable : {},
                      ]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={[
                    styles.budgetButton,
                    { backgroundColor: colors.primary },
                    !isDirty || isLoading || isUpdating ? styles.disable : {},
                  ]}
                  onPress={handleSubmit(handlePress)}
                  disabled={!isDirty || isLoading || isUpdating || isDeleting}>
                  {isLoading || isUpdating ? (
                    <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
                  ) : null}
                  <Text
                    style={[
                      styles.btntitle,
                      { color: colors.onPrimary },
                      isLoading || isUpdating ? styles.disable : {},
                    ]}>
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
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
    textAlign: 'center',
  },
  dateHeader: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-500',
    // color applied inline via theme colors at each usage site
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
    fontSize: FontSize.md,
    fontFamily: 'Inter-600',
    // color applied inline via theme colors at each usage site
  },
  subMenuContainer: {
    // paddingVertical: 4,
  },
  subText: {
    fontSize: FontSize.sm,
    marginTop: 2,
    fontFamily: 'Inter-500',
    // color applied inline via theme colors at each usage site
  },
  card: {
    paddingVertical: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonRounded: {
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    width: 'auto',
  },
  modal: {
    width: deviceWidth() - 60,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontFamily: 'Inter-600',
  },
  budgetButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: Spacing.xl,
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
    // color applied inline via colors.onPrimary at each usage site (text on a solid-colored button)
    fontSize: FontSize.md,
    fontFamily: 'Inter-600',
  },
});

export default Budget;
