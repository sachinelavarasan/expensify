import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
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

import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';
import { formatToCurrency } from '@/utils/formatter';

export default function Category() {
  const { colors } = useThemeContext();
  const { categories, loading } = useCategoryList();
  const router = useRouter();
  const { mutateAsync: reorderList, isPending: isLoading } = useReorderCategories();
  // const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [dataList, setDataList] = useState<ICategoryWithCount[]>([]);
  const [systemList, setSystemList] = useState<ICategoryWithCount[]>([]);

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
  const tabIndex = useSharedValue(0);

  useEffect(() => {
    tabIndex.value = withTiming(activeTab === 'income' ? 0 : 1, { duration: 220 });
  }, [activeTab]);

  const tabIndicatorStyle = useAnimatedStyle(() => ({
    left: `${tabIndex.value * 50}%`,
  }));

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
        <View style={[styles.tabContainer, { backgroundColor: colors.barBackground }]}>
          <Animated.View
            style={[styles.tabIndicator, { backgroundColor: colors.primary }, tabIndicatorStyle]}
          />
          <TouchableOpacity
            style={styles.tab}
            onPress={() => {
              setActiveTab('income');
              setDataList(incomeCategories);
            }}>
            <Text
              style={[
                styles.tabText,
                { color: colors.description },
                activeTab === 'income' && { color: colors.onPrimary },
              ]}>
              Income · {incomeCategories.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => {
              setActiveTab('expense');
              setDataList(expenseCategories);
            }}>
            <Text
              style={[
                styles.tabText,
                { color: colors.description },
                activeTab === 'expense' && { color: colors.onPrimary },
              ]}>
              Expense · {expenseCategories.length}
            </Text>
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
            data={dataList}
            onDragEnd={({ data }) => {
              reArrangeOrder(data);
            }}
            ListHeaderComponent={() => (
              <>
                {systemList.length > 0 && (
                  <>
                    <Text style={[styles.sectionLabel, { color: colors.lighterTitle }]}>
                      Default
                    </Text>
                    {systemList.map((item) => (
                      <View
                        key={item.exp_tc_id}
                        style={[
                          styles.card,
                          {
                            backgroundColor: colors.inputColor,
                            borderColor: colors.inputBorder,
                            shadowColor: colors.shadow,
                          },
                        ]}>
                        <View style={styles.left}>
                          <View
                            style={[
                              styles.iconBox,
                              {
                                backgroundColor:
                                  item.exp_tc_icon_bg_color || colors.categoryFallbackBg,
                              },
                            ]}>
                            {item.exp_tc_icon && (
                              <MaterialIcons
                                name={
                                  item.exp_tc_icon as React.ComponentProps<
                                    typeof MaterialIcons
                                  >['name']
                                }
                                size={18}
                                color={colors.categoryFallbackIcon}
                              />
                            )}
                          </View>
                          <View style={{ flexShrink: 1 }}>
                            <Text
                              style={[styles.name, { color: colors.title }]}
                              numberOfLines={1}>
                              {item.exp_tc_label}
                            </Text>
                            <Text
                              style={[styles.stat, { color: colors.description }]}
                              numberOfLines={1}>
                              {Number(item.transaction_count) > 0
                                ? `${formatToCurrency(item.total_spend)} · ${item.transaction_count} txns`
                                : 'No transactions yet'}
                            </Text>
                          </View>
                        </View>
                        <Ionicons name="lock-closed" size={16} color={colors.lighterTitle} />
                      </View>
                    ))}
                  </>
                )}
                {dataList.length > 0 && (
                  <Text style={[styles.sectionLabel, { color: colors.lighterTitle }]}>
                    Your Categories · long press to reorder
                  </Text>
                )}
              </>
            )}
            ListFooterComponent={<Spacer height={100} />}
            ListEmptyComponent={
              !loading ? (
                <Emptystate
                  title="No custom categories yet"
                  description={`Tap the + button to add your first ${activeTab} category.`}
                />
              ) : null
            }
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            bounces={false}
            keyExtractor={(item, index) => item.exp_tc_label + index}
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
                              {
                                backgroundColor:
                                  item.exp_tc_icon_bg_color || colors.categoryFallbackBg,
                              },
                            ]}>
                            {item.exp_tc_icon && (
                              <MaterialIcons
                                name={
                                  item.exp_tc_icon as React.ComponentProps<
                                    typeof MaterialIcons
                                  >['name']
                                }
                                size={18}
                                color={colors.categoryFallbackIcon}
                              />
                            )}
                          </View>
                          <View style={{ flexShrink: 1 }}>
                            <Text
                              style={[styles.name, { color: colors.title }]}
                              numberOfLines={1}>
                              {item.exp_tc_label}
                            </Text>
                            <Text
                              style={[styles.stat, { color: colors.description }]}
                              numberOfLines={1}>
                              {Number(item.transaction_count) > 0
                                ? `${formatToCurrency(item.total_spend)} · ${item.transaction_count} txns`
                                : 'No transactions yet'}
                            </Text>
                          </View>
                        </View>

                        {item.exp_tc_user_id && (
                          <Pressable
                            onLongPress={drag}
                            style={{
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: 35,
                              width: 35,
                              flexShrink: 0,
                            }}>
                            <MaterialIcons name="drag-handle" size={22} color={colors.description} />
                          </Pressable>
                        )}
                      </View>
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 10,
    padding: 5,
    marginHorizontal: 10,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    width: '50%',
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: FontSize.sm,
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
  name: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
  },
  stat: {
    fontSize: FontSize.xs,
    fontFamily: 'Inter-500',
    marginTop: 2,
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
