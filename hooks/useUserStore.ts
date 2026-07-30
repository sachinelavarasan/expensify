import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/apiClient';
import { IExpUser } from '@/types';

export const queryKeys = {
  currentuser: ['currentuser'] as const,
};

export const useGetUserData = () => {
  const {
    data,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<IExpUser, Error>({
    queryKey: queryKeys.currentuser,
    queryFn: async (): Promise<IExpUser> => {
      const response = await apiClient.get<IExpUser>('/expensify/getme');
      return response.data;
    },
  });

  return {
    user: data || null,
    loading,
    error: isError ? error?.message : null,
    refetch,
  };
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const response = await apiClient.put<IExpUser>('/expensify/profile', { name });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentuser });
    },
  });
};

export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageBase64: string) => {
      const response = await apiClient.post<IExpUser>('/expensify/profile/image', {
        imageBase64,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentuser });
    },
  });
};

export const useRemoveProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete<IExpUser>('/expensify/profile/image');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentuser });
    },
  });
};
