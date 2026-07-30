import { useMutation } from '@tanstack/react-query';

import { apiClient } from '@/lib/apiClient';

export const useUploadTransactionAttachment = () => {
  return useMutation({
    mutationFn: async (fileBase64: string) => {
      const response = await apiClient.post<{ url: string }>('/expensify/transaction/attachment', {
        fileBase64,
      });
      return response.data;
    },
  });
};

export const useDeleteTransactionAttachment = () => {
  return useMutation({
    mutationFn: async (url: string) => {
      const response = await apiClient.delete<{ success: boolean }>(
        '/expensify/transaction/attachment',
        { data: { url } },
      );
      return response.data;
    },
  });
};
