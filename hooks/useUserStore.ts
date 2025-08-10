import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';

import { IExpUser } from '@/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const queryKeys = {
  currentuser: ['currentuser'] as const,
};

export const useGetUserData = () => {
  const { getToken, userId } = useAuth();

  const {
    data,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<IExpUser, Error>({
    queryKey: queryKeys.currentuser,
    queryFn: async ({ queryKey }): Promise<IExpUser> => {
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const token = await getToken();

      const response = await fetch(`${API_URL}/expensify/getme`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as IExpUser;
    },
  });

  return {
    user: data || null,
    loading,
    error: isError ? error?.message : null,
    refetch,
  };
};
