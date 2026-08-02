import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Itransaction } from '@/types'; // Update imports as needed
import { apiClient } from '@/lib/apiClient';

export const useSaveTransaction = (starred: boolean | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { exp_ts_id?: string }) => {
      const { exp_ts_id, ...data } = payload;

      const url = exp_ts_id
        ? `/expensify/transaction/${exp_ts_id}`
        : `/expensify/transactions`;

      const res = exp_ts_id
        ? await apiClient.put<Itransaction>(url, data)
        : await apiClient.post<Itransaction>(url, data);

      return res.data;
    },

    onSuccess: () => {
      if (starred) {
        queryClient.invalidateQueries({ queryKey: ['starred-transactions'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      }
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};

export interface ISpendTrendPoint {
  month: string;
  label: string;
  income: number;
  expense: number;
}

export const useSpendTrend = (months = 6) => {
  const { data, isLoading } = useQuery({
    queryKey: ['spend-trend', months],
    queryFn: async (): Promise<ISpendTrendPoint[]> => {
      const res = await apiClient.get('/expensify/transactions/trend', { params: { months } });
      return res.data;
    },
  });

  return {
    trend: data || [],
    loading: isLoading,
  };
};

export interface ICategoryTrendPoint {
  month: string;
  label: string;
  expense: number;
}

export const useCategoryTrend = (categoryId: string | undefined, months = 6, enabled = true) => {
  const { data, isLoading } = useQuery({
    queryKey: ['category-trend', categoryId, months],
    enabled: !!categoryId && enabled,
    queryFn: async (): Promise<ICategoryTrendPoint[]> => {
      const res = await apiClient.get('/expensify/transactions/category-trend', {
        params: { categoryId, months },
      });
      return res.data;
    },
  });

  return {
    trend: data || [],
    loading: isLoading,
  };
};

export const useFetchTransaction = (exp_ts_id?: string) => {
  return useQuery({
    queryKey: ['transaction', exp_ts_id],
    enabled: !!exp_ts_id,
    queryFn: async () => {
      const res = await apiClient.get(`/expensify/transaction/${exp_ts_id}`);
      return res.data;
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/expensify/transaction/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['trashed-transactions'] });
    },
  });
};

export const useGetTrashedTransactions = () => {
  const {
    data: trashed,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['trashed-transactions'],
    queryFn: async () => {
      const res = await apiClient.get('/expensify/transactions/trash');
      return res.data;
    },
  });

  return {
    trashed: trashed || [],
    isLoading,
    error: isError ? error?.message : null,
    refetch,
  };
};

export const useRestoreTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/expensify/transaction/${id}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['trashed-transactions'] });
    },
  });
};

export const usePurgeTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/expensify/transaction/${id}/purge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trashed-transactions'] });
    },
  });
};

export const useBulkDeleteTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await apiClient.delete('/expensify/transactions/bulk', { data: { ids } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['trashed-transactions'] });
    },
  });
};

export const useBulkUpdateTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ids,
      patch,
    }: {
      ids: string[];
      patch: { exp_tc_id?: string; exp_ts_tags?: string[] };
    }) => {
      await apiClient.patch('/expensify/transactions/bulk', { ids, patch });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['trashed-transactions'] });
    },
  });
};

export const useBulkStarTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await apiClient.post('/expensify/starred/bulk', { ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['starred-transactions'] });
    },
  });
};

export const useBulkUnstarTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await apiClient.delete('/expensify/starred/bulk', { data: { ids } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['starred-transactions'] });
    },
  });
};
