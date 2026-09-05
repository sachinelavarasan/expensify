import { apiClient } from '@/lib/apiClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  CreateRecurringTransactionDto,
  IRecurringTransaction,
  UpdateRecurringTransactionDto,
} from '@/types';
import { syncPlannedPaymentReminders } from '@/utils/plannedPaymentReminders';

export const queryKeys = {
  recurringTransactions: ['recurringTransactions'] as const,
};

export const useRecurringTransactions = () => {
  const {
    data: recurringTransactions,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.recurringTransactions,
    queryFn: async (): Promise<IRecurringTransaction[]> => {
      const response = await apiClient.get<IRecurringTransaction[]>(
        '/expensify/recurring-transactions',
      );
      return response.data;
    },
  });

  return {
    recurringTransactions: recurringTransactions || [],
    loading: isLoading,
    refetch,
  };
};

export const useAddRecurringTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRecurringTransactionDto) => {
      const res = await apiClient.post('/expensify/recurring-transaction', data);
      return res.data as IRecurringTransaction;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringTransactions });
      syncPlannedPaymentReminders(created?.exp_rt_id);
    },
  });
};

export const useUpdateRecurringTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateRecurringTransactionDto) => {
      const res = await apiClient.put(`/expensify/recurring-transaction/${data.exp_rt_id}`, data);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringTransactions });
      syncPlannedPaymentReminders(variables.exp_rt_id);
    },
  });
};

export const useImportRecurringTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recurringIds: string[]) => {
      const res = await apiClient.post('/expensify/recurring-transactions/import', {
        recurringIds,
      });
      return res.data as { imported: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringTransactions });
      syncPlannedPaymentReminders();
    },
  });
};

export const useDeleteRecurringTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/expensify/recurring-transaction/${id}`);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringTransactions });
      syncPlannedPaymentReminders(id);
    },
  });
};
