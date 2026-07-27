import { useAuth } from '@clerk/clerk-expo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  CreateRecurringTransactionDto,
  IRecurringTransaction,
  UpdateRecurringTransactionDto,
} from '@/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const queryKeys = {
  recurringTransactions: ['recurringTransactions'] as const,
};

export const useRecurringTransactions = () => {
  const { getToken, userId } = useAuth();

  const {
    data: recurringTransactions,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.recurringTransactions,
    queryFn: async (): Promise<IRecurringTransaction[]> => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const response = await fetch(`${API_URL}/expensify/recurring-transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as IRecurringTransaction[];
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
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateRecurringTransactionDto) => {
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const token = await getToken();
      const res = await fetch(`${API_URL}/expensify/recurring-transaction`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to add recurring transaction');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringTransactions });
    },
  });
};

export const useUpdateRecurringTransaction = () => {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (data: UpdateRecurringTransactionDto) => {
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const token = await getToken();
      const res = await fetch(`${API_URL}/expensify/recurring-transaction/${data.exp_rt_id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update recurring transaction');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringTransactions });
    },
  });
};

export const useImportRecurringTransactions = () => {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (recurringIds: number[]) => {
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const token = await getToken();
      const res = await fetch(`${API_URL}/expensify/recurring-transactions/import`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recurringIds }),
      });

      if (!res.ok) throw new Error('Failed to import recurring transactions');
      return (await res.json()) as { imported: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringTransactions });
    },
  });
};

export const useDeleteRecurringTransaction = () => {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const token = await getToken();
      const res = await fetch(`${API_URL}/expensify/recurring-transaction/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete recurring transaction');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringTransactions });
    },
  });
};
