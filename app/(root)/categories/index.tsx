import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import ProfileHeader from '@/components/ProfileHeader';
import { useCategoryList, useReorderCategories } from '@/hooks/useCategoryListOperation';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Link, useRouter } from 'expo-router';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ICategoryWithCount } from '@/types';
import OverlayLoader from '@/components/Overlay';
import Spacer from '@/components/Spacer';
import Emptystate from '@/components/Emptystate';
import SegmentedControl from '@/components/SegmentedControl';

import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';
import { formatToCurrency } from '@/utils/formatter';

function CategoryCard({
  item,
  colors,
  maxSpend,
  locked,
  pressed,
  onDrag,
  reorderable = true,
}: {
  item: ICategoryWithCount;
  colors: ReturnType<typeof useThemeContext>['colors'];
  maxSpend: number;
  locked: boolean;
  pressed?: boolean;
  onDrag?: () => void;
  reorderable?: boolean;
}) {
  const spend = Number(item.total_spend) || 0;
  const hasTxns = Number(item.transaction_count) > 0;
  const barPct = hasTxns ? Math.min(100, (spend / maxSpend) * 100) : 0;
  const barColor = item.exp_tc_icon_bg_color || colors.categoryFallbackIcon;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: pressed ? colors.barBackground : colors.inputColor,
          borderColor: colors.inputBorder,
          shadowColor: colors.shadow,
        },
      ]}>
      <View style={styles.left}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: item.exp_tc_icon_bg_color || colors.categoryFallbackBg },
          ]}>
          {item.exp_tc_icon && (
            <MaterialIcons
              name={item.exp_tc_icon as React.ComponentProps<typeof MaterialIcons>['name']}
              size={18}
              color={colors.categoryFallbackIcon}
            />
          )}
        </View>
        <View style={{ flexShrink: 1, flex: 1 }}>
          <View style={styles.rowTop}>
            <Text
              style={[styles.name, { color: colors.title }]}
              numberOfLines={1}>
              {item.exp_tc_label}
            </Text>
            {hasTxns && (
              <Text style={[styles.amount, { color: colors.title }]}>
                {formatToCurrency(item.total_spend)}
              </Text>
            )}
          </View>
          <Text
            style={[styles.stat, { color: hasTxns ? colors.description : colors.lighterTitle }]}
            numberOfLines={1}>
            {hasTxns ? `${item.transaction_count} txns` : 'No transactions yet'}
          </Text>
          <View style={[styles.barTrack, { backgroundColor: colors.barBackground }]}>
            <View style={[styles.barFill, { width: `${barPct}%`, backgroundColor: barColor }]} />
          </View>
        </View>
      </View>

      {locked ? (
        <Ionicons name="lock-closed" size={16} color={colors.lighterTitle} />
      ) : (
        item.exp_tc_user_id &&
        reorderable && (
          <Pressable
            onLongPress={onDrag}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: 35,
              width: 35,
              flexShrink: 0,
            }}>
            <MaterialIcons name="drag-handle" size={22} color={colors.description} />
          </Pressable>
        )
      )}
    </View>
  );
}

export default function Category() {
  const { colors } = useThemeContext();
  const { categories, loading } = useCategoryList();
  const router = useRouter();
  const { mutateAsync: reorderList, isPending: isLoading } = useReorderCategories();
  // const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [dataList, setDataList] = useState<ICategoryWithCount[]>([]);
  const [systemList, setSystemList] = useState<ICategoryWithCount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'custom' | 'spend'>('custom');

  // const onRefresh = useCallback(() => {
  //   setRefreshing(true);
  //   setTimeout(() => {
  //     refetch();
  //     setRefreshing(false);
  //   }, 2000);
  // }, []);

  const incomeCategories = useMemo(
    () =>
      categories
        .filter(
          (item: ICategoryWithCount) =>
            item.exp_tc_transaction_type === 2 && item.exp_tc_user_id !== null,
        )
        .sort(
          (a: { exp_tc_sort_order: any }, b: { exp_tc_sort_order: any }) =>
            Number(a.exp_tc_sort_order) - Number(b.exp_tc_sort_order),
        ),
    [categories],
  );

  const expenseCategories = useMemo(
    () =>
      categories
        .filter(
          (item: ICategoryWithCount) =>
            item.exp_tc_transaction_type === 1 && item.exp_tc_user_id !== null,
        )
        .sort(
          (a: { exp_tc_sort_order: any }, b: { exp_tc_sort_order: any }) =>
            Number(a.exp_tc_sort_order) - Number(b.exp_tc_sort_order),
        ),
    [categories],
  );

  useEffect(() => {
    if(categories?.length){
      setDataList(activeTab === 'income' ? incomeCategories : expenseCategories);
    const list = categories?.filter(
      (item: ICategoryWithCount) =>
        ((item.exp_tc_transaction_type === 1 && activeTab === 'expense') ||
          (item.exp_tc_transaction_type === 2 && activeTab === 'income')) &&
        item.exp_tc_user_id === null,
    );
    setSystemList(list);
    }
  }, [activeTab, categories, expenseCategories, incomeCategories]);

  const maxSpend = useMemo(() => {
    const max = Math.max(
      ...systemList.map((item) => Number(item.total_spend) || 0),
      ...dataList.map((item) => Number(item.total_spend) || 0),
      0,
    );
    return max > 0 ? max : 1;
  }, [systemList, dataList]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isReorderable = sortMode === 'custom' && !normalizedQuery;

  const applySearchAndSort = useCallback(
    (list: ICategoryWithCount[]) => {
      let result = normalizedQuery
        ? list.filter((item) => item.exp_tc_label.toLowerCase().includes(normalizedQuery))
        : list;
      if (sortMode === 'spend') {
        result = [...result].sort(
          (a, b) => (Number(b.total_spend) || 0) - (Number(a.total_spend) || 0),
        );
      }
      return result;
    },
    [normalizedQuery, sortMode],
  );

  const filteredSystemList = useMemo(
    () => applySearchAndSort(systemList),
    [systemList, applySearchAndSort],
  );
  const filteredDataList = useMemo(
    () => applySearchAndSort(dataList),
    [dataList, applySearchAndSort],
  );

  const reArrangeOrder = (data: ICategoryWithCount[]) => {
    const updatedData = data.map((item, index) => ({
      ...item,
      exp_tc_sort_order: index + 1,
    }));
    reorderList(updatedData);
    setDataList(data);
  };
  const handlePress = () => {
    router.push('/(root)/categories/add');
  };

  const scrollY = useSharedValue(0);
  const buttonVisible = useSharedValue(1);

  const scrollHandler = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent;
    const currentY = contentOffset.y;

    if (currentY + 200 > scrollY.value) {
      buttonVisible.value = withTiming(0);
    } else {
      buttonVisible.value = withTiming(1);
    }

    scrollY.value = currentY;
  };

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonVisible.value,
      transform: [
        {
          translateX: withTiming(buttonVisible.value ? 0 : 150, { duration: 200 }),
        },
      ],
    };
  });

  return (
    <SafeAreaViewComponent>
      <ThemedView
        style={{
          flex: 1,
          paddingHorizontal: 10,
        }}>
        {(loading || isLoading) && <OverlayLoader />}
        <Animated.View
          style={[
            styles.floatingButton,
            { backgroundColor: colors.primary, shadowColor: colors.shadow },
            animatedButtonStyle,
          ]}>
          <TouchableOpacity style={styles.floatingButtonInner} onPress={handlePress}>
            <Entypo name="plus" size={18} color={colors.onPrimary} />
            <Text style={[styles.floatingButtonText, { color: colors.onPrimary }]}>
              Add Category
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <ProfileHeader title="Categories" />
        <View style={styles.segmentWrapper}>
          <SegmentedControl
            value={activeTab}
            options={[
              { id: 'income', label: 'Income', count: incomeCategories.length },
              { id: 'expense', label: 'Expense', count: expenseCategories.length },
            ]}
            onChange={(id) => {
              const type = id as 'income' | 'expense';
              setActiveTab(type);
              setDataList(type === 'income' ? incomeCategories : expenseCategories);
            }}
          />
        </View>

        <View style={styles.toolbar}>
          <View
            style={[
              styles.searchBox,
              { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
            ]}>
            <Ionicons name="search" size={14} color={colors.lighterTitle} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search categories"
              placeholderTextColor={colors.lighterTitle}
              style={[styles.searchInput, { color: colors.title }]}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sortChip,
              { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
            ]}
            onPress={() => setSortMode((prev) => (prev === 'custom' ? 'spend' : 'custom'))}>
            <Text style={[styles.sortChipText, { color: colors.title }]}>
              {sortMode === 'spend' ? 'Top spend' : 'Custom order'}
            </Text>
            <MaterialIcons name="swap-vert" size={16} color={colors.lighterTitle} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          <DraggableFlatList
            contentContainerStyle={{
              paddingHorizontal: 10,
            }}
            scrollEventThrottle={16}
            onScrollBeginDrag={scrollHandler}
            onScrollEndDrag={() => {
              buttonVisible.value = withTiming(1, { duration: 200 });
            }}
            data={filteredDataList}
            onDragEnd={({ data }) => {
              if (isReorderable) {
                reArrangeOrder(data);
              }
            }}
            ListHeaderComponent={() => (
              <>
                {filteredSystemList.length > 0 && (
                  <>
                    <Text style={[styles.sectionLabel, { color: colors.lighterTitle }]}>
                      Default
                    </Text>
                    {filteredSystemList.map((item) => (
                      <View key={item.exp_tc_id}>
                        <CategoryCard item={item} colors={colors} maxSpend={maxSpend} locked />
                      </View>
                    ))}
                  </>
                )}
                {filteredDataList.length > 0 && (
                  <Text style={[styles.sectionLabel, { color: colors.lighterTitle }]}>
                    {normalizedQuery
                      ? `${filteredDataList.length} match${filteredDataList.length === 1 ? '' : 'es'}`
                      : sortMode === 'spend'
                        ? 'Your Categories · sorted by top spend'
                        : 'Your Categories · long press to reorder'}
                  </Text>
                )}
              </>
            )}
            ListFooterComponent={<Spacer height={100} />}
            ListEmptyComponent={
              !loading ? (
                normalizedQuery && dataList.length > 0 ? (
                  <Emptystate
                    title="No matches"
                    description={`No categories match "${searchQuery}".`}
                  />
                ) : (
                  <Emptystate
                    title="No custom categories yet"
                    description={`Tap the + button to add your first ${activeTab} category.`}
                  />
                )
              ) : null
            }
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            bounces={false}
            keyExtractor={(item) => String(item.exp_tc_id)}
            renderItem={({ item, drag, isActive }: RenderItemParams<ICategoryWithCount>) => (
              <ScaleDecorator activeScale={1.05}>
                <Link
                  disabled={isActive}
                  href={{
                    pathname: '/categories/[id]',
                    params: { id: item.exp_tc_id, data: JSON.stringify(item) },
                  }}
                  asChild>
                  <Pressable>
                    {({ pressed }) => (
                      <CategoryCard
                        item={item}
                        colors={colors}
                        maxSpend={maxSpend}
                        locked={false}
                        pressed={pressed}
                        onDrag={drag}
                        reorderable={isReorderable}
                      />
                    )}
                  </Pressable>
                </Link>
              </ScaleDecorator>
            )}
          />
        </View>
      </ThemedView>
    </SafeAreaViewComponent>
  );
}

const styles = StyleSheet.create({
  segmentWrapper: {
    marginBottom: 16,
    marginHorizontal: 10,
  },
  toolbar: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 10,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    padding: 0,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 36,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 10,
  },
  sortChipText: {
    fontSize: FontSize.xs,
    fontFamily: 'Inter-600',
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontFamily: 'Inter-600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 6,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 0,
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconBox: {
    height: 32,
    width: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    flexShrink: 1,
  },
  amount: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    flexShrink: 0,
  },
  stat: {
    fontSize: FontSize.xs,
    fontFamily: 'Inter-500',
    marginTop: 2,
  },
  barTrack: {
    height: 3,
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  floatingButton: {
    borderRadius: 25,
    position: 'absolute',
    bottom: 45,
    right: 0,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 2,
    marginRight: 20,
  },
  floatingButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  floatingButtonText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
  },
});
