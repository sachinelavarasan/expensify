import { useMutation } from '@tanstack/react-query';

import { apiClient } from '@/lib/apiClient';

export const useAICategorySuggestion = () => {
  return useMutation({
    mutationFn: async (data: { title: string; exp_tt_id: number }) => {
      const res = await apiClient.post<{ exp_tc_id: string | null }>(
        '/expensify/ai/suggest-category',
        data,
      );
      return res.data.exp_tc_id;
    },
  });
};
