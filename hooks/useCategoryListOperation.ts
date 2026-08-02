import { ICategory, ICategoryWithCount } from '@/types';
import { apiClient } from '@/lib/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const queryKeys = {
  categories: ['categories'] as const,
};

export const useCategoryList = () => {
  const {
    data: categories,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<ICategoryWithCount[], Error>({
    queryKey: queryKeys.categories,
    queryFn: async (): Promise<ICategoryWithCount[]> => {
      const response = await apiClient.get<ICategoryWithCount[]>('/expensify/categories');
      return response.data;
    },
  });

  return {
    categories: categories || [],
    loading,
    error: isError ? error?.message : null,
    refetch,
  };
};

export const useReorderCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Pick<ICategory, 'exp_tc_id' | 'exp_tc_sort_order'>[]) => {
      const response = await apiClient.patch('/expensify/categories/reorder', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useAddCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Pick<
        ICategory,
        'exp_tc_label' | 'exp_tc_icon' | 'exp_tc_transaction_type' | 'exp_tc_icon_bg_color'
      >,
    ) => {
      const res = await apiClient.post('/expensify/categories', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
export const useEditCategory = () => {
  const queryClient = useQueryClient();

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
      const res = await apiClient.put(`/expensify/categories/${data.exp_tc_id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/expensify/categories/${id}`);
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
