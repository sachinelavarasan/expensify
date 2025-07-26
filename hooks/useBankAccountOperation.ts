import { useAuth } from '@clerk/clerk-expo';

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

export interface BankAccount {
  exp_ba_id: number;
  exp_ba_name: string;
  exp_ba_type: string;
  exp_ba_balance: number;
  exp_ba_user_id: number;
}

export type CreateBankAccountDto = Omit<BankAccount, 'exp_ba_id'>;
export type UpdateBankAccountDto = Partial<CreateBankAccountDto> & { exp_ba_id: number };

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const queryKeys = {
  bankAccounts: ['bankAccounts'] as const,
};

export const useAddBankAccount = () => {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  if (!userId) {
    throw new Error('User is not authenticated');
  }

  return useMutation({
    mutationFn: async (data: CreateBankAccountDto) => {
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
      queryClient.invalidateQueries({ queryKey: ['transaction'] });
    },
  });
};

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  if (!userId) {
    throw new Error('User is not authenticated');
  }

  return useMutation({
    mutationFn: async (data: UpdateBankAccountDto) => {
      const token = await getToken();
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction'] });
    },
  });
};

export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  if (!userId) {
    throw new Error('User is not authenticated');
  }

  return useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
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

  if (!userId) {
    throw new Error('User is not authenticated');
  }
  return useQuery({
    queryKey: queryKeys.bankAccounts,
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/expensify/accounts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch accounts');
      return await res.json();
    },
  });
};
