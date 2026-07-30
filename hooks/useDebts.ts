import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/apiClient';
import { IDebt, IDebtDetail } from '@/types';

export const queryKeys = {
  debts: ['debts'] as const,
  debtDetail: (id: string) => ['debtDetail', id] as const,
};

export const useDebts = () => {
  const {
    data: debts,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<IDebt[], Error>({
    queryKey: queryKeys.debts,
    queryFn: async () => {
      const res = await apiClient.get('/expensify/debts');
      return res.data;
    },
  });

  return {
    debts: debts || [],
    loading,
    error: isError ? error?.message : null,
    refetch,
  };
};

export const useDebt = (id: string) => {
  const {
    data: debt,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<IDebtDetail, Error>({
    queryKey: queryKeys.debtDetail(id),
    queryFn: async () => {
      const res = await apiClient.get(`/expensify/debts/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  return {
    debt: debt || null,
    loading,
    error: isError ? error?.message : null,
    refetch,
  };
};
