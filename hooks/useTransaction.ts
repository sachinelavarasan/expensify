import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Itransaction } from '@/types'; // Update imports as needed
import { useAuth } from '@clerk/clerk-expo';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const useSaveTransaction = (starred: boolean | undefined) => {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (payload: { exp_ts_id?: string }) => {
      const token = await getToken();

      if (!userId) {
        throw new Error('User is not authenticated');
      }

      const { exp_ts_id, ...data } = payload;

      const url = exp_ts_id
        ? `${API_URL}/expensify/transaction/${exp_ts_id}`
        : `${API_URL}/expensify/transactions`;

      const method = exp_ts_id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API error: ${res.status} - ${errText}`);
      }

      return res.json() as Promise<Itransaction>;
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
  const { getToken, userId } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['spend-trend', months],
    queryFn: async (): Promise<ISpendTrendPoint[]> => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }

      const res = await fetch(`${API_URL}/expensify/transactions/trend?months=${months}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }

      return await res.json();
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
  const { getToken, userId } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['category-trend', categoryId, months],
    enabled: !!categoryId && enabled,
    queryFn: async (): Promise<ICategoryTrendPoint[]> => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }

      const res = await fetch(
        `${API_URL}/expensify/transactions/category-trend?categoryId=${categoryId}&months=${months}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }

      return await res.json();
    },
  });

  return {
    trend: data || [],
    loading: isLoading,
  };
};

export const useFetchTransaction = (exp_ts_id?: string) => {
  const { getToken, userId } = useAuth();

  return useQuery({
    queryKey: ['transaction', exp_ts_id],
    enabled: !!exp_ts_id,
    queryFn: async () => {
      const token = await getToken();

      if (!token || !userId) {
        throw new Error('Missing token or transaction ID');
      }

      const res = await fetch(`${API_URL}/expensify/transaction/${exp_ts_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Fetch error: ${res.status} - ${errorText}`);
      }

      return await res.json();
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const res = await fetch(`${API_URL}/expensify/transaction/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete transaction');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });
};
