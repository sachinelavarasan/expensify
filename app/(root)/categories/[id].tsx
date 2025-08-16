import {
  Alert,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CustomColorSwatches } from '@/components/ColorPicker';
import IconPicker from '@/components/IconPicker';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import { MaterialIcons } from '@expo/vector-icons';
import Input from '@/components/Input';
import Spacer from '@/components/Spacer';
import ProfileHeader from '@/components/ProfileHeader';
import { categoriesStatic, TransactionType } from '@/utils/common-data';
import { showToast } from '@/components/ToastMessage';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import {
  useAddCategory,
  useDeleteCategory,
  useEditCategory,
} from '@/hooks/useCategoryListOperation';
import CustomRadioButton from '@/components/CustomRadioButton';
import OverlayLoader from '@/components/Overlay';
import { ICategoryWithCount } from '@/types';

const Category = () => {
  const router = useRouter();

  const { id, data } = useLocalSearchParams<{ id: string; data?: string }>();
  const { mutateAsync: addCategory, isPending: isAdding } = useAddCategory();
  const { mutateAsync: editCategory, isPending: isEditing } = useEditCategory();
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteCategory();
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [categoryDetail, setCategoryDetail] = useState({
    exp_tc_icon: 'category',
    exp_tc_icon_bg_color: '#36454F',
    exp_tc_label: '',
    exp_tc_transaction_type: 1,
  });

  const onSelect = (key: string, data: string | number) => {
    setCategoryDetail((state) => ({
      ...state,
      [key]: data,
    }));
  };

  useEffect(() => {
    if (data) {
      const category = JSON.parse(data) as unknown as ICategoryWithCount;
      setCategoryDetail((state) => ({
        ...state,
        exp_tc_icon: category.exp_tc_icon || '',
        exp_tc_icon_bg_color: category.exp_tc_icon_bg_color || '',
        exp_tc_label: category.exp_tc_label || '',
        exp_tc_transaction_type: category.exp_tc_transaction_type,
      }));
      setTransactionCount(Number(category.transaction_count));
    }
  }, [data]);
  const handlePress = () => {
    if (categoryDetail.exp_tc_label.trim().length === 0) {
      showToast({
        text1: 'Please enter category name!',
        type: 'error',
        position: 'bottom',
      });
      return;
    }
    if (id === 'add') {
      addCategory(categoryDetail)
        .then(() => {
          showToast({
            text1: 'New category added successfully',
            type: 'success',
            position: 'bottom',
          });
          router.back();
        })
        .catch(() => {
          showToast({
            text1: 'Server Error',
            type: 'error',
            position: 'bottom',
          });
        });
    } else if (id) {
      editCategory({ exp_tc_id: Number(id), ...categoryDetail })
        .then(() => {
          showToast({
            text1: 'Category updated successfully',
            type: 'success',
            position: 'bottom',
          });
          router.back();
        })
        .catch(() => {
          showToast({
            text1: 'Server Error',
            type: 'error',
            position: 'bottom',
          });
        });
    }
  };

  const handleDelete = async () => {
    if (!id) {
      return;
    }
    try {
      const confirm = await new Promise((resolve) =>
        Alert.alert(
          'Delete this category?',
          `Has ${transactionCount} transactions\n \nAll transactions will be moved to the 'Others' category.`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
          ],
          // { cancelable: true },
        ),
      );

      if (!confirm) return;

      deleteCategory(Number(id))
        .then(() => {
          showToast({
            text1: 'Category removed successfully',
            type: 'success',
            position: 'bottom',
          });
          router.back();
        })
        .catch(() => {
          showToast({
            text1: 'Server Error',
            type: 'error',
            position: 'bottom',
          });
        });
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
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
      <ThemedView style={styles.container}>
        {(isAdding || isEditing || isDeleting) && <OverlayLoader />}
        <Animated.View style={[styles.floatingButton, animatedButtonStyle]}>
          <TouchableOpacity
            style={{
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handlePress}>
            <MaterialIcons name="check" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>

        <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
          <ProfileHeader
            title={id === 'add' ? 'Add New Category' : 'Update Category'}
            deleteAction={id === 'add' ? undefined : handleDelete}
          />
        </View>
        <FlatList
          data={[1]}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
          }}
          scrollEventThrottle={16}
          onScrollBeginDrag={scrollHandler}
          onScrollEndDrag={() => {
            buttonVisible.value = withTiming(1, { duration: 200 });
          }}
          bounces={false}
          showsVerticalScrollIndicator={false}
          renderItem={() => {
            return (
              <View>
                <CustomRadioButton
                  // label="Transaction Type"
                  value={categoryDetail.exp_tc_transaction_type}
                  options={TransactionType}
                  onChange={(data) => {
                    onSelect('exp_tc_transaction_type', data);
                  }}
                />
                <Spacer height={20} />
                <Input
                  placeholder="Category Name"
                  keyboardType="numbers-and-punctuation"
                  autoCapitalize="none"
                  autoComplete="off"
                  value={categoryDetail.exp_tc_label}
                  onChangeText={(text) => {
                    onSelect('exp_tc_label', text);
                  }}
                  borderLess
                />
                <Spacer height={30} />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={{
                      color: '#1E1E1E',
                      fontSize: 18,
                      marginVertical: 10,
                      marginHorizontal: 5,
                      fontFamily: 'Inter-700',
                    }}>
                    Preview
                  </Text>
                  <Pressable style={[styles.iconBox]}>
                    <View
                      style={{
                        backgroundColor: categoryDetail.exp_tc_icon_bg_color || '#282343',
                        padding: 5,
                        borderRadius: 5,
                        height: 40,
                        width: 40,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {categoryDetail?.exp_tc_icon && (
                        <MaterialIcons
                          name={
                            categoryDetail.exp_tc_icon as React.ComponentProps<
                              typeof MaterialIcons
                            >['name']
                          }
                          size={24}
                          color="#fff"
                        />
                      )}
                    </View>
                  </Pressable>
                </View>
                <CustomColorSwatches
                  currentValue={categoryDetail.exp_tc_icon_bg_color}
                  onSelect={(icon) => {
                    onSelect('exp_tc_icon_bg_color', icon);
                  }}
                />
                <IconPicker
                  currentValue={categoryDetail.exp_tc_icon}
                  onSelect={(color) => {
                    onSelect('exp_tc_icon', color);
                  }}
                />
              </View>
            );
          }}
        />
      </ThemedView>
    </SafeAreaViewComponent>
  );
};

export default Category;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 8,
  },
  floatingButton: {
    backgroundColor: '#6B5DE6',
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
