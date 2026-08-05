import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useMemo, useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import { MaterialIcons } from '@expo/vector-icons';
import RowInput from '@/components/RowInput';
import IconPickerSheet from '@/components/IconPickerSheet';
import ColorPickerSheet from '@/components/ColorPickerSheet';
import SegmentedControl from '@/components/SegmentedControl';
import CategorySelector from '@/components/CategorySelector';
import ModalCard from '@/components/ModalCard';
import Spacer from '@/components/Spacer';
import ProfileHeader from '@/components/ProfileHeader';
import { CoreTransactionType } from '@/utils/common-data';
import { showToast } from '@/components/ToastMessage';
import {
  useAddCategory,
  useDeleteCategory,
  useEditCategory,
  useGetCategoryCache,
} from '@/hooks/useCategoryListOperation';
import OverlayLoader from '@/components/Overlay';
import { ICategoryWithCount } from '@/types';
import { useThemeContext } from '@/contexts/ThemedContext';
import { getApiErrorMessage } from '@/lib/apiClient';
import { getCategoryIconName } from '@/utils/categoryIcon';
import { Spacing } from '@/utils/Spacing';
import { FontSize } from '@/utils/Typography';

const Category = () => {
  const router = useRouter();
  const { colors } = useThemeContext();

  const { id, data } = useLocalSearchParams<{ id: string; data?: string }>();
  const { mutateAsync: addCategory, isPending: isAdding } = useAddCategory();
  const { mutateAsync: editCategory, isPending: isEditing } = useEditCategory();
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteCategory();
  const { categories: cachedCategories } = useGetCategoryCache();

  // `data` is a fixed route param for this screen's lifetime (set once by
  // the Link that navigated here), so the initial state can just be computed
  // directly from it via useState's lazy initializer - no effect, and no
  // "did this prop change" dance needed for a value that never changes.
  const existingCategory = data ? (JSON.parse(data) as unknown as ICategoryWithCount) : null;

  const [transactionCount] = useState<number>(() =>
    existingCategory ? Number(existingCategory.transaction_count) : 0,
  );
  const [categoryDetail, setCategoryDetail] = useState(() =>
    existingCategory
      ? {
          exp_tc_icon: existingCategory.exp_tc_icon || '',
          exp_tc_icon_bg_color: existingCategory.exp_tc_icon_bg_color || '',
          exp_tc_label: existingCategory.exp_tc_label || '',
          exp_tc_transaction_type: existingCategory.exp_tc_transaction_type,
        }
      : {
          exp_tc_icon: 'category',
          exp_tc_icon_bg_color: '#36454F',
          exp_tc_label: '',
          exp_tc_transaction_type: 1,
        },
  );

  const onSelect = (key: string, data: string | number) => {
    setCategoryDetail((state) => ({
      ...state,
      [key]: data,
    }));
  };

  const isSaving = isAdding || isEditing;

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
        .catch((err) => {
          showToast({
            text1: getApiErrorMessage(err, 'Server Error'),
            type: 'error',
            position: 'bottom',
          });
        });
    } else if (id) {
      editCategory({ exp_tc_id: id, ...categoryDetail })
        .then(() => {
          showToast({
            text1: 'Category updated successfully',
            type: 'success',
            position: 'bottom',
          });
          router.back();
        })
        .catch((err) => {
          showToast({
            text1: getApiErrorMessage(err, 'Server Error'),
            type: 'error',
            position: 'bottom',
          });
        });
    }
  };

  // Categories the deleted category's transactions could be reassigned to:
  // same transaction type, not the category being deleted itself. 'Others'
  // (the pre-selected default - see openDeleteConfirm) is moved to the front
  // so the default choice is visible without scrolling the picker.
  const reassignOptions = useMemo(() => {
    const options = cachedCategories.filter(
      (item) =>
        item.exp_tc_transaction_type === categoryDetail.exp_tc_transaction_type &&
        item.exp_tc_id !== id,
    );
    const othersIndex = options.findIndex((item) => item.exp_tc_label === 'Others');
    if (othersIndex > 0) {
      const [others] = options.splice(othersIndex, 1);
      options.unshift(others);
    }
    return options;
  }, [cachedCategories, categoryDetail.exp_tc_transaction_type, id]);

  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [reassignCategoryId, setReassignCategoryId] = useState('');

  const openDeleteConfirm = () => {
    const others = reassignOptions.find((item) => item.exp_tc_label === 'Others');
    setReassignCategoryId(others?.exp_tc_id || '');
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = () => {
    if (!id) return;
    deleteCategory({
      id,
      targetCategoryId: transactionCount > 0 ? reassignCategoryId : undefined,
    })
      .then(() => {
        showToast({
          text1: 'Category removed successfully',
          type: 'success',
          position: 'bottom',
        });
        router.back();
      })
      .catch((err) => {
        showToast({
          text1: getApiErrorMessage(err, 'Server Error'),
          type: 'error',
          position: 'bottom',
        });
      })
      .finally(() => {
        setDeleteConfirmVisible(false);
      });
  };

  return (
    <SafeAreaViewComponent>
      <ThemedView style={styles.container}>
        {(isAdding || isEditing || isDeleting) && <OverlayLoader />}

        <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
          <ProfileHeader
            title={id === 'add' ? 'Add New Category' : 'Update Category'}
            deleteAction={id === 'add' ? undefined : openDeleteConfirm}
          />
        </View>

        <FlatList
          data={[1]}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 100,
          }}
          bounces={false}
          showsVerticalScrollIndicator={false}
          renderItem={() => (
            <View>
              <View style={styles.hero}>
                <View
                  style={[
                    styles.heroAvatar,
                    { backgroundColor: categoryDetail.exp_tc_icon_bg_color || colors.categoryFallbackBg },
                  ]}>
                  <MaterialIcons
                    name={getCategoryIconName(categoryDetail.exp_tc_icon)}
                    size={34}
                    color={colors.onPrimary}
                  />
                </View>
                <Text style={[styles.heroCaption, { color: colors.description }]}>Live preview</Text>
              </View>

              <SegmentedControl
                value={categoryDetail.exp_tc_transaction_type}
                options={CoreTransactionType}
                onChange={(data) => onSelect('exp_tc_transaction_type', data)}
              />
              <Spacer height={Spacing.lg} />

              <Text style={[styles.cardLabel, { color: colors.lighterTitle }]}>Details</Text>
              <View
                style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
                <RowInput
                  icon={<Text style={[styles.rowGlyph, { color: colors.primary }]}>Aa</Text>}
                  label="Name"
                  value={categoryDetail.exp_tc_label}
                  placeholder="Category Name"
                  autoCapitalize="none"
                  autoComplete="off"
                  onChangeText={(text) => onSelect('exp_tc_label', text)}
                />
                <IconPickerSheet
                  value={categoryDetail.exp_tc_icon}
                  previewColor={categoryDetail.exp_tc_icon_bg_color}
                  onChange={(icon) => onSelect('exp_tc_icon', icon)}
                />
                <ColorPickerSheet
                  value={categoryDetail.exp_tc_icon_bg_color}
                  onChange={(color) => onSelect('exp_tc_icon_bg_color', color)}
                  showDivider={false}
                />
              </View>
            </View>
          )}
        />

        <View style={[styles.footer, { backgroundColor: colors.bottomBarBackground }]}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }, isSaving ? styles.disable : {}]}
            disabled={isSaving}
            onPress={handlePress}>
            {isSaving ? (
              <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
            ) : null}
            <Text style={[styles.buttonTitle, { color: colors.onPrimary }, isSaving ? styles.textDisable : {}]}>
              {id === 'add' ? 'Save category' : 'Update category'}
            </Text>
          </TouchableOpacity>
        </View>

        <ModalCard
          visible={deleteConfirmVisible}
          onClose={() => setDeleteConfirmVisible(false)}
          title="Delete this category?"
          closeDisabled={isDeleting}>
          {transactionCount > 0 ? (
            <>
              <Text style={{ color: colors.description, fontFamily: 'Inter-500', fontSize: FontSize.sm }}>
                This category has {transactionCount} transaction{transactionCount === 1 ? '' : 's'}.
                Choose where they should move to:
              </Text>
              <Spacer height={14} />
              {reassignOptions.length > 0 ? (
                <CategorySelector
                  categories={reassignOptions}
                  selected={reassignCategoryId}
                  onSelect={setReassignCategoryId}
                />
              ) : (
                <Text style={{ color: colors.expense, fontFamily: 'Inter-500', fontSize: FontSize.sm }}>
                  No other {categoryDetail.exp_tc_transaction_type === 2 ? 'income' : 'expense'}{' '}
                  category exists to move these transactions to.
                </Text>
              )}
            </>
          ) : (
            <Text style={{ color: colors.description, fontFamily: 'Inter-500', fontSize: FontSize.sm }}>
              This category has no transactions.
            </Text>
          )}
          <Spacer height={24} />
          <View style={{ flexDirection: 'row', gap: Spacing.xl, justifyContent: 'center' }}>
            <TouchableOpacity
              style={[styles.modalButton, { borderColor: colors.inputBorder, borderWidth: 1 }]}
              onPress={() => setDeleteConfirmVisible(false)}
              disabled={isDeleting}>
              <Text style={[styles.modalButtonText, { color: colors.description }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: colors.expense },
                (isDeleting || (transactionCount > 0 && !reassignCategoryId)) ? styles.disable : {},
              ]}
              onPress={confirmDelete}
              disabled={isDeleting || (transactionCount > 0 && !reassignCategoryId)}>
              {isDeleting ? (
                <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
              ) : null}
              <Text
                style={[
                  styles.modalButtonText,
                  { color: colors.onPrimary },
                  isDeleting ? styles.textDisable : {},
                ]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </ModalCard>
      </ThemedView>
    </SafeAreaViewComponent>
  );
};

export default Category;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  heroAvatar: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCaption: {
    fontSize: FontSize.xs,
    fontFamily: 'Inter-500',
  },
  cardLabel: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.lg,
  },
  rowGlyph: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-700',
  },
  footer: {
    elevation: 10,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 12,
  },
  loader: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTitle: {
    fontSize: FontSize.md,
    fontFamily: 'Inter-600',
  },
  disable: {
    opacity: 0.7,
  },
  textDisable: { opacity: 0 },
  modalButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 9,
  },
  modalButtonText: {
    fontSize: FontSize.md,
    fontFamily: 'Inter-600',
  },
});
