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

export const useCategoryTrend = (categoryId: number | undefined, months = 6, enabled = true) => {
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
    mutationFn: async (id: number) => {
      await apiClient.delete(`/expensify/transaction/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });
};
