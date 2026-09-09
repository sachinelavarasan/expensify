import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import MonthSwitcher from '@/components/MonthSwitch';
import useBudgetsForMonth from '@/hooks/useBudget';
import BudgetSummaryCard from '@/components/BudgetSummaryCard';
import BudgetCategoryFilters, { BudgetCategoryFilter } from '@/components/BudgetCategoryFilters';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useThemeContext } from '@/contexts/ThemedContext';
import { MaterialIcons } from '@expo/vector-icons';
import { formatToCurrency } from '@/utils/formatter';
import BudgetFormSheet, {
  BudgetFormValues,
  BudgetFormSheetRef,
} from '@/components/BudgetFormSheet';
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
import BudgetEmptyIllustration from '@/components/BudgetEmptyIllustration';
import { useFocusEffect } from 'expo-router';
import { getApiErrorMessage } from '@/lib/apiClient';
import { FontSize } from '@/utils/Typography';

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
  const budgetSheetRef = useRef<BudgetFormSheetRef>(null);
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

  const openBudgetSheet = (data: IBudget) => {
    budgetSheetRef.current?.present(data);
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

  const handlePress = (data: BudgetFormValues, target: IBudget) => {
    if (target.exp_bg_id) {
      const body = {
        ...data,
        exp_bg_id: target.exp_bg_id,
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
          budgetSheetRef.current?.dismiss();
          refetch();
        });
    } else {
      const body = {
        ...data,
        exp_bg_category_id: target.categoryId,
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
          budgetSheetRef.current?.dismiss();
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

  const handleDelete = (target: IBudget) => {
    if (!target.exp_bg_id) {
      return;
    }
    deleteBudget(target.exp_bg_id)
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
        budgetSheetRef.current?.dismiss();
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
                      openModal={openBudgetSheet}
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
                  illustration={<BudgetEmptyIllustration />}
                  title="No budgets for this month"
                  description={
                    filteredNonBudgeted.length > 0
                      ? "Copy last month's limits, or set one for a category below."
                      : 'Set a monthly limit on a category to track its spending here.'
                  }>
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
                        style={[
                          styles.unbudgetedIcon,
                          {
                            backgroundColor: `${iconColor}2E`,
                            borderColor: colors.borderColor,
                          },
                        ]}>
                        <MaterialIcons
                          name={
                            category.icon as React.ComponentProps<typeof MaterialIcons>['name']
                          }
                          size={20}
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
                        onPress={() => openBudgetSheet(category)}>
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
        <BudgetFormSheet
          ref={budgetSheetRef}
          onSubmit={handlePress}
          onDelete={handleDelete}
          submitting={isLoading || isUpdating}
          deleting={isDeleting}
        />
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
    gap: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 14,
  },
  unbudgetedIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default Budget;
