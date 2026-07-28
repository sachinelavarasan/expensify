import {
  BankAccount,
  CreateBankAccountDto,
  IAccountGroupedTransactions,
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
        queryKey: ['accountDetailPaginated', variables.exp_ba_id],
      });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });
};

export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
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

export const useAccountGroupedTransactions = (accountId: number) => {
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
      const res = await apiClient.get(`/expensify/accounts/${accountId}`, {
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
