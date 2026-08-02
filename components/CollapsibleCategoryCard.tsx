import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { deviceWidth } from '@/utils/functions';
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
import { LinearGradient } from 'expo-linear-gradient';
import CategoryTrendSparkline from './CategoryTrendSparkline';
import Emptystate from './Emptystate';
import { FontSize } from '@/utils/Typography';
import ProgressBar from './ProgressBar';

const width = deviceWidth();
const barWidth2 = Math.round((width - 40) * 0.3);


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
          key={category.category}
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
      style={[styles.subMenuContainer, { borderColor: colors.borderColor, borderBottomWidth: 1 }]}>
      <TouchableOpacity activeOpacity={0.7} onPress={toggleExpand}>
        <View style={styles.card}>
          <View style={styles.left}>
            <View
              style={{
                backgroundColor: category.iconBg ? category.iconBg : colors.categoryFallbackBg,
                padding: 5,
                borderRadius: 5,
              }}>
              <MaterialIcons
                name={category.icon as React.ComponentProps<typeof MaterialIcons>['name']}
                size={24}
                color={colors.categoryFallbackIcon}
              />
            </View>
            <View>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: colors.title, flexWrap: 'wrap', maxWidth: 160 },
                  ]}>
                  {category.category}
                </Text>
                <TouchableOpacity onPress={() => openModal(category)}>
                  <MaterialCommunityIcons
                    name="circle-edit-outline"
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <Text style={[styles.subText, { color: colors.description }]}>Remaining:</Text>
                <Text
                  style={[
                    styles.subText,
                    {
                      color: category.remainingBudget > 0 ? colors.title : colors.expense,
                      fontFamily: 'Inter-600',
                    },
                  ]}>
                  {formatToCurrency(category.remainingBudget)}
                </Text>
                <MaterialIcons
                  name={expanded ? 'expand-less' : 'expand-more'}
                  size={24}
                  color={colors.description}
                />
              </View>
            </View>
          </View>
          <View style={{ paddingVertical: 8 }}>
            <ProgressBar
              percentage={(category.totalAmount / Number(category.budgetAmount)) * 100}
              height={20}
              fillColor={category.remainingBudget < 0 ? colors.expense : colors.primary}
              trackColor={colors.borderColor}
              label={
                category.remainingBudget < 0
                  ? 'Exceeded'
                  : `${Math.min(
                      (category.totalAmount / Number(category.budgetAmount)) * 100,
                      100,
                    ).toFixed(2)}% used`
              }
              style={{ marginTop: 6, width: barWidth2 }}
            />
          </View>
        </View>
      </TouchableOpacity>

      <Animated.View style={[animatedStyle, { overflow: 'hidden' }]}>
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
      </Animated.View>

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
                { backgroundColor: category.iconBg ? category.iconBg : colors.categoryFallbackBg },
              ]}>
              <MaterialIcons
                name={category.icon as React.ComponentProps<typeof MaterialIcons>['name']}
                size={20}
                color={colors.categoryFallbackIcon}
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
    marginBottom: 10,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    borderRadius: 8,
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
