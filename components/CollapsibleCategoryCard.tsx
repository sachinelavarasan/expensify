import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import CategoryBudgetTable from './CategoryBudgetTable';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetSectionList,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IBudget, Itransaction } from '@/types';
import { ThemeColors } from '@/utils/Colors';
import { format } from 'date-fns';
import TransactionCard from './TransactionCard';
import CategoryTrendSparkline from './CategoryTrendSparkline';
import Emptystate from './Emptystate';
import { FontSize } from '@/utils/Typography';
import BudgetRing from './BudgetRing';
import { getBudgetTier } from '@/utils/budgetAlerts';


export function BudgetedCategoriesList({
  budgetedCategories,
  colors,
  formatToCurrency,
  openModal,
  currentMonth,
}: {
  budgetedCategories: IBudget[];
  colors: ThemeColors;
  formatToCurrency: (amount: number | string | bigint) => string;
  openModal: (item: IBudget) => void;
  currentMonth: string;
}) {
  return (
    <View>
      {budgetedCategories.map((category: any) => (
        <CollapsibleCategoryCard
          key={category.categoryId}
          category={category}
          colors={colors}
          formatToCurrency={formatToCurrency}
          openModal={openModal}
          currentMonth={currentMonth}
        />
      ))}
    </View>
  );
}

function CollapsibleCategoryCard({
  category,
  colors,
  formatToCurrency,
  openModal,
  currentMonth,
}: {
  category: IBudget;
  colors: ThemeColors;
  formatToCurrency: (amount: number | string | bigint) => string;
  openModal: (item: IBudget) => void;
  currentMonth: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const animatedHeight = useSharedValue(0);
  const validSheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  // Same thresholds BudgetAlerts used to compute its now-removed separate
  // warning list - the signal lives on the row's ring (arc length + colour +
  // the % badge) instead of being said twice (once up top, once again here).
  const usedPct =
    Number(category.budgetAmount) > 0
      ? (category.totalAmount / Number(category.budgetAmount)) * 100
      : 0;
  const tier = getBudgetTier(usedPct, colors);
  const isExceeded = tier.level === 'over';
  const iconColor = category.iconBg || colors.categoryFallbackIcon;

  const animatedStyle = useAnimatedStyle(
    () => ({
      height: withTiming(animatedHeight.value, { duration: 300 }),
    }),
    [expanded],
  );

  const toggleExpand = () => {
    setExpanded(!expanded);
    animatedHeight.value = expanded ? 0 : 190;
  };

  const openTransactions = useCallback(() => {
    validSheetRef.current?.present();
  }, []);

  const closeTransactions = useCallback(() => {
    validSheetRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="none"
        disappearsOnIndex={-1}
        appearsOnIndex={1}
        style={{ backgroundColor: colors.scrim }}
      />
    ),
    [colors],
  );

  const renderPreviewItem = useCallback(
    ({ item }: { item: Itransaction }) => (
      <View style={{ paddingVertical: 5 }}>
        <TransactionCard key={item.exp_ts_id} {...item} noRedirect showTsTime={true} />
      </View>
    ),
    [],
  );

  const sections = useMemo(() => {
    const groups = new Map<string, Itransaction[]>();
    category.transactions.forEach((item) => {
      const existing = groups.get(item.exp_ts_date);
      if (existing) {
        existing.push(item);
      } else {
        groups.set(item.exp_ts_date, [item]);
      }
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([date, data]) => ({
        title: date,
        data,
        total: data.reduce((sum, item) => sum + Number(item.exp_ts_amount), 0),
      }));
  }, [category.transactions]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; total: number } }) => (
      <View style={styles.dateHeaderRow}>
        <Text style={[styles.dateHeaderText, { color: colors.lighterTitle }]}>
          {format(new Date(section.title), 'dd MMM yyyy')}
        </Text>
        <Text style={[styles.dateHeaderTotal, { color: colors.title }]}>
          {formatToCurrency(section.total)}
        </Text>
      </View>
    ),
    [colors, formatToCurrency],
  );

  return (
    <View
      style={[
        styles.subMenuContainer,
        { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
      ]}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity activeOpacity={0.7} onPress={toggleExpand}>
          <View style={styles.card}>
            <BudgetRing
              size={46}
              strokeWidth={4}
              percentage={usedPct}
              color={tier.color}
              trackColor={colors.borderColor}>
              <View style={[styles.ringIcon, { backgroundColor: `${iconColor}2E` }]}>
                <MaterialIcons
                  name={category.icon as React.ComponentProps<typeof MaterialIcons>['name']}
                  size={15}
                  color={iconColor}
                />
              </View>
              <View
                style={[
                  styles.ringPct,
                  { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
                ]}>
                {isExceeded ? (
                  <MaterialIcons name="priority-high" size={10} color={tier.color} />
                ) : (
                  <Text style={[styles.ringPctText, { color: tier.color }]}>
                    {Math.round(usedPct)}%
                  </Text>
                )}
              </View>
            </BudgetRing>

            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text
                  style={[styles.cardTitle, { color: colors.title, maxWidth: 150 }]}
                  numberOfLines={1}>
                  {category.category}
                </Text>
                <TouchableOpacity
                  onPress={() => openModal(category)}
                  hitSlop={8}
                  style={[styles.editBadge, { backgroundColor: `${colors.primary}1A` }]}>
                  <Feather name="edit-2" size={13} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.subText, { color: colors.description, marginTop: 3 }]}>
                {formatToCurrency(category.totalAmount)} of{' '}
                {formatToCurrency(Number(category.budgetAmount))}
              </Text>
            </View>

            <View style={styles.rightCol}>
              <Text
                style={[
                  styles.remaining,
                  { color: isExceeded ? colors.expense : colors.title },
                ]}
                numberOfLines={1}>
                {formatToCurrency(Math.abs(category.remainingBudget))}{' '}
                {category.remainingBudget < 0 ? 'over' : 'left'}
              </Text>
              <MaterialIcons
                name={expanded ? 'expand-less' : 'expand-more'}
                size={22}
                color={colors.description}
              />
            </View>
          </View>
        </TouchableOpacity>

      <Animated.View style={[animatedStyle, { overflow: 'hidden' }]}>
        <View style={styles.expandedContent}>
          <CategoryBudgetTable
            totalSpent={category.totalAmount}
            totalBudget={Number(category.budgetAmount)}
            totalRemaining={category.remainingBudget}
          />
          <CategoryTrendSparkline categoryId={category.categoryId} enabled={expanded} />
          {category.transactions.length > 0 && (
            <TouchableOpacity onPress={openTransactions}>
              <Text
                style={{
                  color: colors.primary,
                  flexWrap: 'wrap',
                  fontFamily: 'Inter-600',
                  fontSize: 14,
                }}>
                View Transactions
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
      </View>

      <BottomSheetModal
        ref={validSheetRef}
        snapPoints={['60%', '92%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: colors.cardBg }}
        handleIndicatorStyle={{ backgroundColor: colors.borderColor }}>
        <View style={styles.sheetHeaderRow}>
          <View style={styles.sheetHeaderLeft}>
            <View
              style={[
                styles.sheetIconBox,
                { backgroundColor: `${iconColor}2E` },
              ]}>
              <MaterialIcons
                name={category.icon as React.ComponentProps<typeof MaterialIcons>['name']}
                size={20}
                color={iconColor}
              />
            </View>
            <View>
              <Text
                style={[styles.sheetTitle, { color: colors.title }]}
                numberOfLines={1}>
                {category.category}
              </Text>
              <Text style={[styles.sheetSubtitle, { color: colors.description }]}>
                {currentMonth} · {category.transactions.length} transaction
                {category.transactions.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={closeTransactions}
            hitSlop={10}
            style={[styles.closeButton, { backgroundColor: colors.inputColor }]}>
            <Ionicons name="close" size={18} color={colors.title} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statChip, { backgroundColor: `${colors.primary}1A` }]}>
            <Text style={[styles.statChipLabel, { color: colors.description }]}>Budget</Text>
            <Text style={[styles.statChipValue, { color: colors.title }]} numberOfLines={1}>
              {formatToCurrency(Number(category.budgetAmount))}
            </Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: `${colors.expense}1A` }]}>
            <Text style={[styles.statChipLabel, { color: colors.description }]}>Spent</Text>
            <Text style={[styles.statChipValue, { color: colors.title }]} numberOfLines={1}>
              {formatToCurrency(category.totalAmount)}
            </Text>
          </View>
          <View
            style={[
              styles.statChip,
              { backgroundColor: `${category.remainingBudget < 0 ? colors.expense : colors.income}1A` },
            ]}>
            <Text style={[styles.statChipLabel, { color: colors.description }]}>
              {category.remainingBudget < 0 ? 'Over by' : 'Remaining'}
            </Text>
            <Text
              style={[
                styles.statChipValue,
                { color: category.remainingBudget < 0 ? colors.expense : colors.title },
              ]}
              numberOfLines={1}>
              {formatToCurrency(Math.abs(category.remainingBudget))}
            </Text>
          </View>
        </View>

        <BottomSheetSectionList
          sections={sections}
          keyExtractor={(item, index) => `${item.exp_ts_id}-${index}`}
          renderItem={renderPreviewItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: 30 + insets.bottom }]}
          stickySectionHeadersEnabled={false}
          initialNumToRender={16}
          maxToRenderPerBatch={16}
          windowSize={7}
          ListEmptyComponent={
            <Emptystate title="No transactions" description="Nothing recorded for this category yet." />
          }
        />
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  subMenuContainer: {
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  expandedContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  ringIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPct: {
    position: 'absolute',
    bottom: -5,
    right: -7,
    minWidth: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  ringPctText: {
    fontSize: 8,
    fontFamily: 'Inter-800',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remaining: {
    fontSize: 13,
    fontFamily: 'Inter-700',
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Inter-600',
  },
  subText: {
    fontSize: 13,
    fontFamily: 'Inter-400',
  },
  sheetTitle: {
    fontSize: 16,
    fontFamily: 'Inter-600',
  },
  sheetSubtitle: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
    marginTop: 2,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sheetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  statChip: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  statChipLabel: {
    fontSize: 10,
    fontFamily: 'Inter-600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statChipValue: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    marginTop: 2,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  dateHeaderText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
  },
  dateHeaderTotal: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
  },
  contentContainer: { paddingBottom: 30, paddingHorizontal: 16 },
});
