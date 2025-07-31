import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';

const API_URL = process.env.EXPO_PUBLIC_API_URL;


export const useGetStarredTransactions = () => {
  const { getToken, userId } = useAuth();

  const {
    data: starred,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['starred-transactions'],
    queryFn: async () => {
      const token = await getToken();

      if (!userId || !token) {
        throw new Error('User is not authenticated');
      }

      const res = await fetch(`${API_URL}/expensify/starred`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to fetch starred transactions: ${res.status} - ${errText}`);
      }

      return await res.json();
    },
    // enabled: !!userId,
  });

  return {
    starred: starred || [],
    isLoading,
    error: isError ? error?.message : null,
    refetch,
  };
};
