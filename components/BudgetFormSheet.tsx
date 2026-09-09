import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Input from './Input';
import Spacer from './Spacer';
import { useThemeContext } from '@/contexts/ThemedContext';
import { IBudget } from '@/types';
import { Spacing } from '@/utils/Spacing';

const schema = z.object({
  exp_bg_amount: z
    .string()
    .nonempty({ message: 'Amount is required' })
    .refine((val) => /^(\d+)(\.\d{1,3})?$/.test(val), {
      message: 'Please enter a valid amount',
    }),
});

export type BudgetFormValues = z.infer<typeof schema>;

export interface BudgetFormSheetRef {
  present: (budget: IBudget) => void;
  dismiss: () => void;
}

interface Props {
  onSubmit: (values: BudgetFormValues, budget: IBudget) => void;
  onDelete: (budget: IBudget) => void;
  submitting?: boolean;
  deleting?: boolean;
}

const BudgetFormSheet = forwardRef<BudgetFormSheetRef, Props>(function BudgetFormSheet(
  { onSubmit, onDelete, submitting = false, deleting = false },
  ref,
) {
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [budget, setBudget] = useState<IBudget | null>(null);
  const busy = submitting || deleting;
  const isEdit = !!budget?.exp_bg_id;

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    defaultValues: { exp_bg_amount: '' },
    resolver: zodResolver(schema),
  });

  useImperativeHandle(ref, () => ({
    present: (next: IBudget) => {
      setBudget(next);
      reset({
        exp_bg_amount: Number(next.budgetAmount) > 0 ? String(next.budgetAmount) : '',
      });
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior={busy ? 'none' : 'close'}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        style={{ backgroundColor: colors.scrim }}
      />
    ),
    [colors, busy],
  );

  const submit = (values: BudgetFormValues) => {
    if (budget) onSubmit(values, budget);
  };

  const iconColor = budget?.iconBg || colors.categoryFallbackIcon;

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      enablePanDownToClose={!busy}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.cardBg }}
      handleIndicatorStyle={{ backgroundColor: colors.borderColor }}>
      <BottomSheetView style={[styles.content, { paddingBottom: 22 + insets.bottom }]}>
        <Text style={[styles.title, { color: colors.title }]}>
          {isEdit ? 'Edit Budget' : 'Set Budget'}
        </Text>

        {budget ? (
          <View style={styles.categoryRow}>
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: `${iconColor}2E`, borderColor: colors.borderColor },
              ]}>
              <MaterialIcons
                name={budget.icon as React.ComponentProps<typeof MaterialIcons>['name']}
                size={20}
                color={iconColor}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.categoryLabel, { color: colors.description }]}>Category</Text>
              <Text style={[styles.categoryName, { color: colors.title }]} numberOfLines={1}>
                {budget.category}
              </Text>
            </View>
          </View>
        ) : null}

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

        <Spacer height={28} />

        <View style={styles.actions}>
          {isEdit ? (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.expense }, busy && styles.disable]}
              onPress={() => budget && onDelete(budget)}
              disabled={busy}>
              {deleting ? (
                <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
              ) : null}
              <Text
                style={[styles.buttonText, { color: colors.onPrimary }, deleting && styles.hide]}>
                Delete
              </Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              (!isDirty || busy) && styles.disable,
            ]}
            onPress={handleSubmit(submit)}
            disabled={!isDirty || busy}>
            {submitting ? (
              <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
            ) : null}
            <Text
              style={[styles.buttonText, { color: colors.onPrimary }, submitting && styles.hide]}>
              {isEdit ? 'Update' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default BudgetFormSheet;

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-600',
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  categoryIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-500',
  },
  categoryName: {
    fontSize: 16,
    fontFamily: 'Inter-600',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-600',
  },
  loader: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disable: {
    opacity: 0.6,
  },
  hide: {
    opacity: 0,
  },
});
