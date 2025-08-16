import {
  BankAccount,
  CreateBankAccountDto,
  IAccountGroupedTransactions,
  UpdateBankAccountDto,
} from '@/types';
import { useAuth } from '@clerk/clerk-expo';

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const queryKeys = {
  bankAccounts: ['bankAccounts'] as const,
};

export const useAddBankAccount = () => {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateBankAccountDto) => {
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const token = await getToken();
      const res = await fetch(`${API_URL}/expensify/accounts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to add account');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });
};

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (data: UpdateBankAccountDto) => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const res = await fetch(`${API_URL}/expensify/accounts/${data.exp_ba_id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update account');
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['accountDetail', String(variables.exp_ba_id)],
      });
    },
  });
};

export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const res = await fetch(`${API_URL}/expensify/accounts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete account');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction'] });
    },
  });
};

export const useBankAccounts = () => {
  const { getToken, userId } = useAuth();

  const {
    data: accounts,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<BankAccount[], Error>({
    queryKey: queryKeys.bankAccounts,
    queryFn: async () => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const res = await fetch(`${API_URL}/expensify/accounts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch accounts');
      return await res.json();
    },
  });
  return {
    accounts: accounts || [],
    loading,
    error: isError ? error?.message : null,
    refetch,
  };
};

export const useAccountGroupedTransactions = (accountId: number) => {
  const { getToken, userId } = useAuth();

  const {
    data: account,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<IAccountGroupedTransactions, Error>({
    queryKey: ['accountDetail', accountId],
    queryFn: async () => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const res = await fetch(`${API_URL}/expensify/accounts/${accountId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch account transactions');
      }

      return res.json();
    },
    enabled: !!accountId,
  });

  return {
    account: account || null,
    loading,
    error: isError ? error?.message : null,
    refetch,
  };
};
export const useGetUserBankAccounts = () => {
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<BankAccount[]>(queryKeys.bankAccounts);
  return {
    accounts: data || [],
  };
};
