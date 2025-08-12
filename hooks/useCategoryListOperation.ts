import { ICategory } from '@/types';
import { categoriesStatic } from '@/utils/common-data';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const queryKeys = {
  categories: ['categories'] as const,
};

export const useCategoryList = () => {
  const { getToken, userId } = useAuth();

  const {
    data: categories,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<ICategory[], Error>({
    queryKey: queryKeys.categories,
    queryFn: async ({ queryKey }): Promise<ICategory[]> => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }

      const response = await fetch(`${API_URL}/expensify/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as ICategory[];
    },
  });

  return {
    categories: categories || categoriesStatic,
    loading,
    error: isError ? error?.message : null,
    refetch,
  };
};

export const useReorderCategories = () => {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (data: Pick<ICategory, 'exp_tc_id' | 'exp_tc_sort_order'>[]) => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/expensify/categories/reorder`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to reorder categories');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useAddCategory = () => {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (
      data: Pick<
        ICategory,
        'exp_tc_label' | 'exp_tc_icon' | 'exp_tc_transaction_type' | 'exp_tc_icon_bg_color'
      >,
    ) => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const res = await fetch(`${API_URL}/expensify/categories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to add account');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
export const useEditCategory = () => {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (
      data: Pick<
        ICategory,
        | 'exp_tc_label'
        | 'exp_tc_icon'
        | 'exp_tc_transaction_type'
        | 'exp_tc_icon_bg_color'
        | 'exp_tc_id'
      >,
    ) => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const res = await fetch(`${API_URL}/expensify/categories/${data.exp_tc_id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to add account');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const res = await fetch(`${API_URL}/expensify/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete caregory');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useGetCategoryCache = () => {
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<ICategory[]>(['categories']);
  return {
    categories: data || [],
  };
};
