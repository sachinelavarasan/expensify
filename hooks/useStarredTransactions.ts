import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export const useGetStarredTransactions = () => {
  const {
    data: starred,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['starred-transactions'],
    queryFn: async () => {
      const res = await apiClient.get('/expensify/starred');
      return res.data;
    },
  });

  return {
    starred: starred || [],
    isLoading,
    error: isError ? error?.message : null,
    refetch,
  };
};
