import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
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
import { ICategory } from '@/types';
import OverlayLoader from '@/components/Overlay';
import Spacer from '@/components/Spacer';

import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export default function Category() {
  const { categories, loading } = useCategoryList();
  const router = useRouter();
  const { mutateAsync: reorderList, isPending: isLoading } = useReorderCategories();
  // const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [dataList, setDataList] = useState<ICategory[]>([]);
  const [systemList, setSystemList] = useState<ICategory[]>([]);

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
        .filter((item) => item.exp_tc_transaction_type === 2 && item.exp_tc_user_id !== null)
        .sort((a, b) => Number(a.exp_tc_sort_order) - Number(b.exp_tc_sort_order)),
    [categories],
  );

  const expenseCategories = useMemo(
    () =>
      categories
        .filter((item) => item.exp_tc_transaction_type === 1 && item.exp_tc_user_id !== null)
        .sort((a, b) => Number(a.exp_tc_sort_order) - Number(b.exp_tc_sort_order)),
    [categories],
  );

  useEffect(() => {
    setDataList(activeTab === 'income' ? incomeCategories : expenseCategories);
    const list = categories.filter(
      (item) =>
        ((item.exp_tc_transaction_type === 1 && activeTab === 'expense') ||
          (item.exp_tc_transaction_type === 2 && activeTab === 'income')) &&
        item.exp_tc_user_id === null,
    );
    setSystemList(list);
  }, [activeTab, categories, expenseCategories, incomeCategories]);

  const reArrangeOrder = (data: ICategory[]) => {
    const updatedData = data.map((item, index) => ({
      ...item,
      exp_tc_sort_order: index + 1,
    }));
    reorderList(updatedData);
    setDataList(data);
  };
  const handlePress = () => {
    router.push('/(root)/categories/add',);
  };

  const scrollY = useSharedValue(0);
    const buttonVisible = useSharedValue(1);
  
    const scrollHandler = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = event.nativeEvent;
      const currentY = contentOffset.y;
  
      if ((currentY + 200) > scrollY.value) {
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
        <Animated.View style={[styles.floatingButton, animatedButtonStyle]}>
          <TouchableOpacity style={{width: '100%', height: '100%', alignItems:'center',justifyContent: 'center' }} onPress={handlePress}>
            <Entypo name="plus" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
        <ProfileHeader title="Categories" />
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'income' && styles.activeTab]}
            onPress={() => {
              setActiveTab('income');
              setDataList(incomeCategories);
            }}>
            <Text style={[styles.tabText, activeTab === 'income' && styles.activeTabText]}>
              Income
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'expense' && styles.activeTab]}
            onPress={() => {
              setActiveTab('expense');
              setDataList(expenseCategories);
            }}>
            <Text style={[styles.tabText, activeTab === 'expense' && styles.activeTabText]}>
              Expense
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
                {systemList.map((item) => (
                  <Link
                    key={item.exp_tc_id}
                    disabled={true}
                    href={{
                      pathname: '/categories/[id]',
                      params: { id: item.exp_tc_id, data: JSON.stringify(item) },
                    }}
                    asChild>
                    <TouchableOpacity style={styles.card}>
                      <View style={styles.left}>
                        <Pressable>
                          <View
                            style={{
                              backgroundColor: item.exp_tc_icon_bg_color || '#282343',
                              padding: 5,
                              borderRadius: 5,
                              height: 35,
                              width: 35,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            {item.exp_tc_icon && (
                              <MaterialIcons
                                name={
                                  item.exp_tc_icon as React.ComponentProps<
                                    typeof MaterialIcons
                                  >['name']
                                }
                                size={24}
                                color="#e0deed"
                              />
                            )}
                          </View>
                        </Pressable>
                        <Text style={styles.name}>{item.exp_tc_label}</Text>
                      </View>
                    </TouchableOpacity>
                  </Link>
                ))}
              </>
            )}
            ListFooterComponent={<Spacer height={100} />}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            bounces={false}
            keyExtractor={(item, index) => item.exp_tc_label + index}
            renderItem={({ item, drag, isActive }: RenderItemParams<ICategory>) => (
              <ScaleDecorator activeScale={1.05}>
                <Link
                  disabled={isActive}
                  href={{
                    pathname: '/categories/[id]',
                    params: { id: item.exp_tc_id, data: JSON.stringify(item) },
                  }}
                  asChild>
                  <TouchableOpacity style={styles.card}>
                    <View style={styles.left}>
                      <Pressable>
                        <View
                          style={{
                            backgroundColor: item.exp_tc_icon_bg_color || '#282343',
                            padding: 5,
                            borderRadius: 5,
                            height: 35,
                            width: 35,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          {item.exp_tc_icon && (
                            <MaterialIcons
                              name={
                                item.exp_tc_icon as React.ComponentProps<
                                  typeof MaterialIcons
                                >['name']
                              }
                              size={24}
                              color="#e0deed"
                            />
                          )}
                        </View>
                      </Pressable>
                      <Text style={styles.name}>
                        {item.exp_tc_label}
                        {isActive}
                      </Text>
                    </View>

                    <View>
                      {item.exp_tc_user_id && (
                        <Pressable
                          onLongPress={drag}
                          style={{
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            height: 35,
                            width: 35,
                          }}>
                          <Ionicons name="reorder-two" size={24} color="#A0A0A0" />
                        </Pressable>
                      )}
                    </View>
                  </TouchableOpacity>
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
    backgroundColor: '#1e1a32',
    borderRadius: 8,
    padding: 5,
    marginHorizontal: 10,
  },
  tab: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#463e75',
    borderRadius: 8,
  },
  tabText: {
    color: '#B3B1C4',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  card: {
    padding: 10,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    color: '#A0A0A0',
    fontSize: 14,
    fontFamily: 'Inter-500',
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  name: {
    color: '#F1F1F6',
    fontSize: 14,
    fontFamily: 'Inter-500',
  },
  subText: {
    color: '#B3B1C4',
    fontSize: 12,
    fontFamily: 'Inter-400',
  },
  subTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  floatingButton: {
    backgroundColor: '#5a4f96', // Replace with your primary color
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 45,
    right: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 2,
    marginRight: 20,
  },
});
