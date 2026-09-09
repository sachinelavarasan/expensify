import {
  BankAccount,
  CreateBankAccountDto,
  IAccountSummary,
  IAccountTransactionsPage,
  ITransactionGroup,
  UpdateBankAccountDto,
} from '@/types';
import { apiClient } from '@/lib/apiClient';

import { useMutation, useQueryClient, useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const ACCOUNT_TRANSACTIONS_PAGE_SIZE = 30;

export const queryKeys = {
  bankAccounts: ['bankAccounts'] as const,
};

export const useAddBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBankAccountDto) => {
      const res = await apiClient.post('/expensify/accounts', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });
};

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateBankAccountDto) => {
      const res = await apiClient.put(`/expensify/accounts/${data.exp_ba_id}`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['accountSummary', variables.exp_ba_id],
      });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });
};

export const useSetPrimaryBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.patch(`/expensify/accounts/${id}/primary`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      // Setting a primary demotes whichever account held it before, so any
      // mounted account-detail view (not just the one just promoted) may be
      // showing a stale exp_ba_is_primary - invalidate the whole family.
      queryClient.invalidateQueries({ queryKey: ['accountSummary'] });
    },
  });
};

export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/expensify/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });
};

export const useBankAccounts = () => {
  const {
    data: accounts,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<BankAccount[], Error>({
    queryKey: queryKeys.bankAccounts,
    queryFn: async () => {
      const res = await apiClient.get('/expensify/accounts');
      return res.data;
    },
  });
  return {
    accounts: accounts || [],
    loading,
    error: isError ? error?.message : null,
    refetch,
  };
};

export const useAccountSummary = (accountId: string) => {
  const {
    data,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<IAccountSummary, Error>({
    queryKey: ['accountSummary', accountId],
    queryFn: async () => {
      const res = await apiClient.get(`/expensify/accounts/${accountId}`);
      return res.data;
    },
    enabled: !!accountId,
  });

  return {
    account: data ?? null,
    loading,
    error: isError ? error?.message : null,
    refetch,
  };
};

export const useAccountTransactions = (accountId: string) => {
  const {
    data,
    isLoading: loading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<IAccountTransactionsPage, Error>({
    queryKey: ['accountTransactionsPaginated', accountId],
    queryFn: async ({ pageParam }) => {
      const res = await apiClient.get(`/expensify/accounts/${accountId}/transactions`, {
        params: { page: pageParam, limit: ACCOUNT_TRANSACTIONS_PAGE_SIZE },
      });
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined),
    enabled: !!accountId,
  });

  // Pages come back pre-grouped by month; since transactions are fetched newest-first,
  // a month can only ever straddle the boundary between the end of one page and the
  // start of the next, so merging just needs to check the last accumulated group.
  const groups = useMemo(() => {
    const pages = data?.pages;
    if (!pages || pages.length === 0) return [];

    const merged: ITransactionGroup[] = [];
    for (const page of pages) {
      for (const group of page.data) {
        const last = merged[merged.length - 1];
        if (last && last.title === group.title) {
          last.income += group.income;
          last.expense += group.expense;
          last.data = last.data.concat(group.data);
        } else {
          merged.push({ ...group, data: [...group.data] });
        }
      }
    }
    return merged;
  }, [data]);

  return {
    groups,
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
