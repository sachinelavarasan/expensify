import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export const useStarTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      await apiClient.post('/expensify/starred', { exp_st_transaction_id: transactionId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['starred-transactions'] });
    },
  });
};

export const useUnstarTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      await apiClient.delete(`/expensify/starred/${transactionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['starred-transactions'] });
    },
  });
};
