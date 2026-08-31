import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import ProfileHeader from '@/components/ProfileHeader';
import ModalCard from '@/components/ModalCard';
import Input from '@/components/Input';
import DatePickerPaper from '@/components/DatePickerPaper';
import Spacer from '@/components/Spacer';
import AddDebt from '@/components/AddDebt';
import ProgressBar from '@/components/ProgressBar';
import Emptystate from '@/components/Emptystate';
import { showToast } from '@/components/ToastMessage';
import { useDebt } from '@/hooks/useDebts';
import {
  useAddDebtRepayment,
  useDeleteDebt,
  useDeleteDebtRepayment,
} from '@/hooks/useDebtOperation';
import { useThemeContext } from '@/contexts/ThemedContext';
import { getApiErrorMessage } from '@/lib/apiClient';
import { formatToCurrency } from '@/utils/formatter';
import { FontSize } from '@/utils/Typography';
import { useConfirm } from '@/hooks/useConfirm';

const repaymentSchema = z.object({
  exp_dr_amount: z
    .string()
    .refine((val) => /^(\d+)(\.\d{1,2})?$/.test(val) && parseFloat(val) > 0, {
      message: 'Please enter a valid amount',
    }),
  exp_dr_date: z.string().min(1, { message: 'Choose a date' }),
  exp_dr_note: z.string().trim().optional(),
});

type RepaymentFormValues = z.infer<typeof repaymentSchema>;

export default function DebtDetail() {
  const { confirm, confirmModal } = useConfirm();
  const { colors } = useThemeContext();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { debt, loading, refetch } = useDebt(id);
  const { mutateAsync: deleteDebt, isPending: isDeleting } = useDeleteDebt();
  const { mutateAsync: addRepayment, isPending: isAddingRepayment } = useAddDebtRepayment();
  const { mutateAsync: deleteRepayment } = useDeleteDebtRepayment();

  const [repaymentModalVisible, setRepaymentModalVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RepaymentFormValues>({
    defaultValues: { exp_dr_amount: '', exp_dr_date: '', exp_dr_note: '' },
    resolver: zodResolver(repaymentSchema),
  });

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete this debt?',
      message: 'This will remove the debt and its repayment history.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true,
    });
    if (!confirmed || !debt) return;

    deleteDebt(debt.exp_dt_id)
      .then(() => {
        showToast({ text1: 'Debt removed', type: 'success', position: 'bottom' });
        router.back();
      })
      .catch((err) => {
        showToast({ text1: getApiErrorMessage(err, 'Server Error'), type: 'error', position: 'bottom' });
      });
  };

  const handleAddRepayment = (data: RepaymentFormValues) => {
    if (!debt) return;
    addRepayment({
      debtId: debt.exp_dt_id,
      data: { ...data, exp_dr_note: data.exp_dr_note || null },
    })
      .then(() => {
        showToast({ text1: 'Repayment logged', type: 'success', position: 'bottom' });
        setRepaymentModalVisible(false);
        reset();
      })
      .catch((err) => {
        showToast({ text1: getApiErrorMessage(err, 'Server Error'), type: 'error', position: 'bottom' });
      });
  };

  const handleDeleteRepayment = async (repaymentId: string) => {
    if (!debt) return;
    const confirmed = await confirm({
      title: 'Remove this repayment?',
      message: 'This will undo its effect on the remaining balance.',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      destructive: true,
    });
    if (!confirmed) return;

    deleteRepayment({ debtId: debt.exp_dt_id, repaymentId }).catch((err) => {
      showToast({ text1: getApiErrorMessage(err, 'Server Error'), type: 'error', position: 'bottom' });
    });
  };

  if (loading || !debt) {
    return (
      <SafeAreaViewComponent edges={['top']}>
        <ThemedView style={styles.container}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </ThemedView>
      </SafeAreaViewComponent>
    );
  }

  const total = Number(debt.exp_dt_amount);
  const remaining = Math.max(total - debt.repaidAmount, 0);
  const isSettled = remaining <= 0;
  const owedToMe = debt.exp_dt_direction === 'owed_to_me';

  return (
    <SafeAreaViewComponent edges={['top']}>
      <ThemedView style={styles.container}>
        <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
          <ProfileHeader title="Debt Details" paddingHorizontal={false}>
            <View style={{ gap: 20, flexDirection: 'row', alignItems: 'center' }}>
              <AddDebt debt={debt} exp_dt_id={debt.exp_dt_id} />
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: `${colors.expense}1A` }]}
                onPress={handleDelete}
                disabled={isDeleting}>
                <MaterialIcons name="delete-forever" size={20} color={colors.expense} />
              </TouchableOpacity>
            </View>
          </ProfileHeader>
        </View>

        <FlatList
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          data={debt.repayments}
          keyExtractor={(item) => item.exp_dr_id}
          ListHeaderComponent={
            <View>
              <View
                style={[
                  styles.summaryCard,
                  { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
                ]}>
                <View style={styles.summaryHeader}>
                  <View
                    style={[
                      styles.iconBadge,
                      { backgroundColor: owedToMe ? `${colors.income}1A` : `${colors.expense}1A` },
                    ]}>
                    <Feather
                      name={owedToMe ? 'arrow-down-left' : 'arrow-up-right'}
                      size={18}
                      color={owedToMe ? colors.income : colors.expense}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.personName, { color: colors.title }]}>
                      {debt.exp_dt_person_name}
                    </Text>
                    <Text style={[styles.subText, { color: colors.description }]}>
                      {owedToMe ? 'Owes you' : 'You owe'}
                      {!!debt.exp_dt_due_date &&
                        ` • Due ${format(parseISO(debt.exp_dt_due_date), 'do MMM yyyy')}`}
                    </Text>
                  </View>
                </View>

                <Spacer height={14} />
                <Text style={[styles.remainingLabel, { color: colors.description }]}>
                  {isSettled ? 'Settled' : 'Remaining'}
                </Text>
                <Text style={[styles.remainingAmount, { color: colors.title }]}>
                  {formatToCurrency(remaining)}
                </Text>
                {!isSettled && (
                  <ProgressBar
                    percentage={total > 0 ? (debt.repaidAmount / total) * 100 : 0}
                    height={8}
                    fillColor={colors.primary}
                    style={{ marginTop: 10 }}
                  />
                )}
                <Text style={[styles.subText, { color: colors.description, marginTop: 6 }]}>
                  {formatToCurrency(debt.repaidAmount)} of {formatToCurrency(total)} repaid
                </Text>

                {!!debt.exp_dt_note && (
                  <Text style={[styles.noteText, { color: colors.description }]}>
                    {debt.exp_dt_note}
                  </Text>
                )}
              </View>

              <Spacer height={16} />
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => setRepaymentModalVisible(true)}>
                <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                  Log Repayment
                </Text>
              </TouchableOpacity>

              <Spacer height={16} />
              <Text style={[styles.sectionLabel, { color: colors.description }]}>
                Repayment History
              </Text>
              <Spacer height={6} />
            </View>
          }
          ListEmptyComponent={
            <Emptystate title="No repayments yet" description="Log a repayment to track progress." />
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.repaymentRow,
                { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
              ]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.repaymentAmount, { color: colors.title }]}>
                  {formatToCurrency(Number(item.exp_dr_amount))}
                </Text>
                <Text style={[styles.subText, { color: colors.description }]}>
                  {format(parseISO(item.exp_dr_date), 'do MMM yyyy')}
                  {!!item.exp_dr_note && ` • ${item.exp_dr_note}`}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteRepayment(item.exp_dr_id)}
                hitSlop={10}>
                <Feather name="trash-2" size={16} color={colors.description} />
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => <Spacer height={8} />}
        />

        <ModalCard
          visible={repaymentModalVisible}
          onClose={() => setRepaymentModalVisible(false)}
          title="Log Repayment">
          <Controller
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Amount"
                keyboardType="numeric"
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                error={errors.exp_dr_amount?.message}
                borderLess
                isRequired
              />
            )}
            name="exp_dr_amount"
          />
          <Spacer height={20} />
          <Controller
            control={control}
            render={({ field }) => (
              <DatePickerPaper
                value={field.value}
                onBlur={field.onBlur}
                onChange={(date) => field.onChange(date)}
                placeholder="Select date"
                error={errors.exp_dr_date?.message}
                isRequired
              />
            )}
            name="exp_dr_date"
          />
          <Spacer height={20} />
          <Controller
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ''}
                label="Note"
                placeholder="Optional note"
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                error={errors.exp_dr_note?.message}
                borderLess
              />
            )}
            name="exp_dr_note"
          />
          <Spacer height={20} />
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              isAddingRepayment && styles.disable,
            ]}
            disabled={isAddingRepayment}
            onPress={handleSubmit(handleAddRepayment)}>
            {isAddingRepayment ? (
              <ActivityIndicator animating color={colors.onPrimary} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Save</Text>
            )}
          </TouchableOpacity>
        </ModalCard>

        {confirmModal}
      </ThemedView>
    </SafeAreaViewComponent>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personName: {
    fontSize: FontSize.md,
    fontFamily: 'Inter-700',
  },
  subText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    marginTop: 2,
  },
  remainingLabel: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  remainingAmount: {
    fontSize: 28,
    fontFamily: 'Inter-700',
    marginTop: 2,
  },
  noteText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
    marginTop: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-600',
  },
  disable: { opacity: 0.6 },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  repaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  repaymentAmount: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-600',
  },
});
