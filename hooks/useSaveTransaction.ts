import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Itransaction } from '@/types'; // Update imports as needed
import { useAuth } from '@clerk/clerk-expo';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const useSaveTransaction = () => {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  if (!userId) {
    throw new Error('User is not authenticated');
  }

  return useMutation({
    mutationFn: async (payload: { exp_ts_id?: string }) => {
      const token = await getToken();

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
      queryClient.invalidateQueries({ queryKey: ['transaction'] });
    },
  });
};
