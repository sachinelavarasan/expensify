import { CreateBudgetDto, UpdateBudgetDto } from "@/types";
import { apiClient } from "@/lib/apiClient";
import { useMutation } from "@tanstack/react-query";

export const queryKeys = {
  budget: ['budgets'] as const,
};

export const useAddBudget = () => {
  return useMutation({
    mutationFn: async (data: CreateBudgetDto) => {
      const res = await apiClient.post('/expensify/budget', data);
      return res.data;
    },
    onSuccess: () => {
    },
  });
};
export const useUpdateBudget = () => {
  return useMutation({
    mutationFn: async (data: UpdateBudgetDto) => {
      const res = await apiClient.patch(`/expensify/budget/${data.exp_bg_id}`, data);
      return res.data;
    },
    onSuccess: () => {
    },
  });
};

export const useDeleteBudget = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/expensify/budget/${id}`);
    },
    onSuccess: () => {
    },
  });
};

export const useCopyPreviousMonthBudgets = () => {
  return useMutation({
    mutationFn: async (data: { exp_bg_date: string }) => {
      const res = await apiClient.post('/expensify/budgets/copy-previous-month', data);
      return res.data as { copied: number; skipped: number };
    },
  });
};
