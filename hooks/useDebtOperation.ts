import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/apiClient';
import { CreateDebtDto, CreateRepaymentDto, UpdateDebtDto } from '@/types';
import { queryKeys } from './useDebts';

export const useAddDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDebtDto) => {
      const res = await apiClient.post('/expensify/debts', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts });
    },
  });
};

export const useUpdateDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDebtDto }) => {
      const res = await apiClient.put(`/expensify/debts/${id}`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debtDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.debts });
    },
  });
};

export const useDeleteDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/expensify/debts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts });
    },
  });
};

export const useAddDebtRepayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ debtId, data }: { debtId: string; data: CreateRepaymentDto }) => {
      const res = await apiClient.post(`/expensify/debts/${debtId}/repayments`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debtDetail(variables.debtId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.debts });
    },
  });
};

export const useDeleteDebtRepayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ debtId, repaymentId }: { debtId: string; repaymentId: string }) => {
      await apiClient.delete(`/expensify/debts/${debtId}/repayments/${repaymentId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debtDetail(variables.debtId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.debts });
    },
  });
};
