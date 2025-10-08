import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { FontAwesome, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { deviceWidth } from '@/utils/functions';
import CategoryBudgetTable from './CategoryBudgetTable';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { IBudget, Itransaction } from '@/types';
import { ThemeColors } from '@/utils/Colors';
import { format } from 'date-fns';
import TransactionCard from './TransactionCard';

const width = deviceWidth();
const barWidth2 = Math.round((width - 40) * 0.3);

function CategoryProgressBar({
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
    <View
      style={{
        height: 20,
        backgroundColor: '#6e6c706c',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 6,
        width: barWidth2,
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
      <View style={StyleSheet.absoluteFillObject}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: 10,
              color: '#FFF',
              lineHeight: 20,
              fontFamily: 'Inter-600',
            }}>
            {exceeded ? 'Exceeded' : `${percentage.toFixed(2)}% used`}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function BudgetedCategoriesList({
  budgetedCategories,
  colors,
  formatToCurrency,
  openModal,
}: {
  budgetedCategories: IBudget[];
  colors: ThemeColors;
  formatToCurrency: (amount: number | string | bigint) => string;
  openModal: (item: IBudget) => void;
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
}: {
  category: IBudget;
  colors: ThemeColors;
  formatToCurrency: (amount: number | string | bigint) => string;
  openModal: (item: IBudget) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const animatedHeight = useSharedValue(0);
  const validSheetRef = useRef<BottomSheetModal>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const animatedStyle = useAnimatedStyle(
    () => ({
      height: withTiming(animatedHeight.value, { duration: 300 }),
    }),
    [expanded],
  );

  const toggleExpand = () => {
    setExpanded(!expanded);
    animatedHeight.value = expanded ? 0 : 100;
  };

  const toggleValid = useCallback(() => {
    isSheetOpen ? validSheetRef.current?.dismiss() : validSheetRef.current?.present();
    setIsSheetOpen((s) => !s);
  }, [isSheetOpen]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
        style={{ backgroundColor: '#0000007f' }}
      />
    ),
    [],
  );

  const renderPreviewItem = useCallback(
    ({ item }: { item: Itransaction }) => (
      <View style={{ paddingVertical: 5 }}>
        <TransactionCard key={item.exp_ts_id} {...item} isStarred showTsTime={true} />
      </View>
    ),
    [colors],
  );

  return (
    <View
      style={[styles.subMenuContainer, { borderColor: colors.borderColor, borderBottomWidth: 1 }]}>
      <TouchableOpacity activeOpacity={0.7} onPress={toggleExpand}>
        <View style={styles.card}>
          <View style={styles.left}>
            <View
              style={{
                backgroundColor: category.iconBg ? category.iconBg : '#282343',
                padding: 5,
                borderRadius: 5,
              }}>
              <MaterialIcons
                name={category.icon as React.ComponentProps<typeof MaterialIcons>['name']}
                size={24}
                color="#e0deed"
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
                      color: category.remainingBudget > 0 ? colors.title : '#d12222',
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
            <CategoryProgressBar
              spentAmount={category.totalAmount}
              budgetAmount={Number(category.budgetAmount)}
              exceeded={category.remainingBudget < 0}
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
        {category.transactions.length > 0 && (
          <TouchableOpacity onPress={toggleValid}>
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
        snapPoints={['35%', '80%']}
        enablePanDownToClose
        onDismiss={toggleValid}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: colors.cardBg }}
        handleIndicatorStyle={{ backgroundColor: '#ccc' }}>
        <Text style={[styles.sheetTitle, { color: colors.title }]}>
          {category.category} transactions
        </Text>
        <Text
          style={[
            styles.subText,
            { color: colors.description, marginLeft: 16, fontFamily: 'Inter-500' },
          ]}>
          {category.transactions.length} transactions
        </Text>
        <BottomSheetFlatList
          data={category.transactions}
          keyExtractor={(_, i) => `v-${i}`}
          renderItem={renderPreviewItem}
          contentContainerStyle={styles.contentContainer}
          initialNumToRender={16}
          maxToRenderPerBatch={16}
          windowSize={7}
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
    color: '#EAEAEA',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 6,
  },
  contentContainer: { padding: 12 },
  itemContainer: {
    padding: 8,
    marginBottom: 12,
    backgroundColor: '#2A2B37',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter-600' },
  subTextContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
});
