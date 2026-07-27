import {
  BankAccount,
  CreateBankAccountDto,
  IAccountGroupedTransactions,
  ITransactionGroup,
  UpdateBankAccountDto,
} from '@/types';
import { useAuth } from '@clerk/clerk-expo';

import { useMutation, useQueryClient, useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const ACCOUNT_TRANSACTIONS_PAGE_SIZE = 30;

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
        queryKey: ['accountDetailPaginated', variables.exp_ba_id],
      });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
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
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
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
    data,
    isLoading: loading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<IAccountGroupedTransactions, Error>({
    // Deliberately a distinct key from the old ['accountDetail', id] single-page
    // query this replaced - reusing that key would let a stale-shaped cache entry
    // (a flat object with no `.pages`) from an older client session collide with
    // useInfiniteQuery's expected {pages, pageParams} shape and crash on read.
    queryKey: ['accountDetailPaginated', accountId],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const res = await fetch(
        `${API_URL}/expensify/accounts/${accountId}?page=${pageParam}&limit=${ACCOUNT_TRANSACTIONS_PAGE_SIZE}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!res.ok) {
        throw new Error('Failed to fetch account transactions');
      }

      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined),
    enabled: !!accountId,
  });

  // Pages come back pre-grouped by month; since transactions are fetched newest-first,
  // a month can only ever straddle the boundary between the end of one page and the
  // start of the next, so merging just needs to check the last accumulated group.
  const account = useMemo(() => {
    const pages = data?.pages;
    if (!pages || pages.length === 0) return null;

    const groups: ITransactionGroup[] = [];
    for (const page of pages) {
      for (const group of page.data) {
        const last = groups[groups.length - 1];
        if (last && last.title === group.title) {
          last.income += group.income;
          last.expense += group.expense;
          last.data = last.data.concat(group.data);
        } else {
          groups.push({ ...group, data: [...group.data] });
        }
      }
    }

    return { ...pages[0], data: groups };
  }, [data]);

  return {
    account,
    loading,
    error: isError ? error?.message : null,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
export const useGetUserBankAccounts = () => {
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<BankAccount[]>(queryKeys.bankAccounts);
  return {
    accounts: data || [],
  };
};
