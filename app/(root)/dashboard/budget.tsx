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
import BudgetSummaryCard from '@/components/BudgetSummaryCard';
import BudgetCategoryFilters, { BudgetCategoryFilter } from '@/components/BudgetCategoryFilters';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useThemeContext } from '@/contexts/ThemedContext';
import { MaterialIcons } from '@expo/vector-icons';
import { formatToCurrency } from '@/utils/formatter';
import ModalCard from '@/components/ModalCard';
import Spacer from '@/components/Spacer';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/Input';
import { showToast } from '@/components/ToastMessage';
import {
  useAddBudget,
  useCopyPreviousMonthBudgets,
  useDeleteBudget,
  useUpdateBudget,
} from '@/hooks/useBudgetOperation';
import { IBudget } from '@/types';
import { BudgetedCategoriesList } from '@/components/CollapsibleCategoryCard';
import OverlayLoader from '@/components/Overlay';
import Emptystate from '@/components/Emptystate';
import { useFocusEffect } from 'expo-router';
import { getApiErrorMessage } from '@/lib/apiClient';
import { Spacing } from '@/utils/Spacing';
import { FontSize } from '@/utils/Typography';

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

const Budget = () => {
  const [show, setShow] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<IBudget | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<BudgetCategoryFilter>('all');
  const { colors } = useThemeContext();
  const { budgets, currentMonth, loading, currentDate,  goToPreviousMonth, goToNextMonth, refetch } =
    useBudgetsForMonth();
  const { mutateAsync: addBudget, isPending: isLoading } = useAddBudget();
  const { mutateAsync: editBudget, isPending: isUpdating } = useUpdateBudget();
  const { mutateAsync: deleteBudget, isPending: isDeleting } = useDeleteBudget();
  const { mutateAsync: copyPreviousMonthBudgets, isPending: isCopying } =
    useCopyPreviousMonthBudgets();

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

  const searchLower = search.trim().toLowerCase();
  const matchesSearch = (category: IBudget) =>
    !searchLower || category.category.toLowerCase().includes(searchLower);

  const filteredBudgeted = budgetedCategories.filter((item) => {
    if (categoryFilter === 'unbudgeted') return false;
    if (categoryFilter === 'over' && item.remainingBudget >= 0) return false;
    return matchesSearch(item);
  });
  const filteredNonBudgeted = nonBudgetedCategories.filter((item) => {
    if (categoryFilter === 'over') return false;
    return matchesSearch(item);
  });

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
        .catch((err) => {
          showToast({
            text1: getApiErrorMessage(err, 'Server Error'),
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
        .catch((err) => {
          showToast({
            text1: getApiErrorMessage(err, 'Server Error'),
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

  const handleCopyPreviousMonth = () => {
    copyPreviousMonthBudgets({ exp_bg_date: currentDate.toISOString() })
      .then(({ copied }) => {
        showToast({
          text1: copied > 0 ? `Copied ${copied} budget${copied === 1 ? '' : 's'}` : 'No budget found for last month',
          type: copied > 0 ? 'success' : 'info',
          position: 'bottom',
        });
        if (copied > 0) {
          refetch();
        }
      })
      .catch((err) => {
        showToast({
          text1: getApiErrorMessage(err, 'Server Error'),
          type: 'error',
          position: 'bottom',
        });
      });
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
      .catch((err) => {
        showToast({
          text1: getApiErrorMessage(err, 'Server Error'),
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

              {budgetedCategories.length > 0 && (
                <View>
                  <BudgetSummaryCard
                    totalSpent={totalSpent}
                    totalBudget={totalBudget}
                    totalRemaining={totalRemaining}
                  />
                </View>
              )}

              <BudgetCategoryFilters
                search={search}
                onSearchChange={setSearch}
                filter={categoryFilter}
                onFilterChange={setCategoryFilter}
              />

              {budgetedCategories.length > 0 ? (
                <View style={{ paddingVertical: 10 }}>
                  <Text style={[styles.dateHeader, { color: colors.lighterTitle }]}>
                    Budgeted Categories
                  </Text>
                  {filteredBudgeted.length > 0 ? (
                    <BudgetedCategoriesList
                      budgetedCategories={filteredBudgeted}
                      colors={colors}
                      formatToCurrency={formatToCurrency}
                      openModal={toggleModal}
                      currentMonth={currentMonth}
                    />
                  ) : (
                    <Text style={[styles.subText, { color: colors.description, paddingVertical: 10 }]}>
                      No categories match your search.
                    </Text>
                  )}
                </View>
              ) : (
                <Emptystate
                  title="No budget set"
                  description="Set a budget for this month to start tracking your spending.">
                  <TouchableOpacity
                    style={[styles.setLimitButton, { backgroundColor: `${colors.primary}1A` }]}
                    onPress={handleCopyPreviousMonth}
                    disabled={isCopying}>
                    {isCopying ? (
                      <ActivityIndicator animating color={colors.primary} />
                    ) : (
                      <Text style={[styles.setLimitText, { color: colors.primary }]}>
                        Copy from last month
                      </Text>
                    )}
                  </TouchableOpacity>
                </Emptystate>
              )}

              {filteredNonBudgeted.length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text style={[styles.dateHeader, { color: colors.lighterTitle }]}>
                    Not Budgeted Categories
                  </Text>

                  {filteredNonBudgeted.map((category) => {
                    const iconColor = category.iconBg || colors.categoryFallbackIcon;
                    return (
                    <FadeInView key={category.categoryId}>
                    <View
                      style={[
                        styles.unbudgetedRow,
                        { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
                      ]}>
                      <View
                        style={{
                          backgroundColor: `${iconColor}2E`,
                          padding: 8,
                          borderRadius: 10,
                        }}>
                        <MaterialIcons
                          name={
                            category.icon as React.ComponentProps<typeof MaterialIcons>['name']
                          }
                          size={24}
                          color={iconColor}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.cardTitle,
                            { color: colors.title, flex: 1, flexWrap: 'wrap' },
                          ]}>
                          {category.category}
                        </Text>
                        <Text style={[styles.subText, { color: colors.description, marginTop: 2 }]}>
                          Spent {formatToCurrency(category.totalAmount)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.setLimitButton, { backgroundColor: `${colors.primary}1A` }]}
                        onPress={() => {
                          toggleModal(category);
                        }}>
                        <Text style={[styles.setLimitText, { color: colors.primary }]}>
                          Set Limit
                        </Text>
                      </TouchableOpacity>
                    </View>
                    </FadeInView>
                    );
                  })}
                </View>
              )}
            </>
          }
        />
        <ModalCard
          visible={show}
          onClose={() => toggleModal()}
          title={currentBudget?.exp_bg_id ? 'Edit Budget' : 'Set Budget'}
          closeDisabled={isLoading || isUpdating || isDeleting}>
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
        </ModalCard>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  dateHeader: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-500',
    // color applied inline via theme colors at each usage site
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontFamily: 'Inter-600',
    // color applied inline via theme colors at each usage site
  },
  subText: {
    fontSize: FontSize.sm,
    marginTop: 2,
    fontFamily: 'Inter-500',
    // color applied inline via theme colors at each usage site
  },
  unbudgetedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 14,
  },
  setLimitButton: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  setLimitText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-700',
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
