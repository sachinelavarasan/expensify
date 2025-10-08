import { CreateBudgetDto, UpdateBudgetDto } from "@/types";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation } from "@tanstack/react-query";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const queryKeys = {
  budget: ['budgets'] as const,
};

export const useAddBudget = () => {
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateBudgetDto) => {
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const token = await getToken();
      const res = await fetch(`${API_URL}/expensify/budget`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to add budget');
      return await res.json();
    },
    onSuccess: () => {
    },
  });
};
export const useUpdateBudget = () => {
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (data: UpdateBudgetDto) => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const res = await fetch(`${API_URL}/expensify/budget/${data.exp_bg_id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update budget');
      return await res.json();
    },
    onSuccess: () => {
    },
  });
};

export const useDeleteBudget = () => {
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const res = await fetch(`${API_URL}/expensify/budget/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete budget');
    },
    onSuccess: () => {
    },
  });
};