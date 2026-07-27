import { useEffect, useState } from 'react';
import { format, startOfMonth, addMonths } from 'date-fns';
import { IBudget } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export const queryKeys = {
  budget: ['budgets'] as const,
};

const useBudgetsForMonth = (initialDate?: Date) => {
  const [currentMonth, setCurrentMonth] = useState(initialDate || new Date());

  const {
    isLoading,
    data: budgets,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.budget, currentMonth],
    queryFn: async ({ queryKey }): Promise<IBudget[]> => {
      const queryDate = queryKey[1] as Date;

      const start = startOfMonth(queryDate);
      const end = addMonths(start, 1);

      const startDate = format(start, 'yyyy-MM-dd');
      const endDate = format(end, 'yyyy-MM-dd');

      const response = await apiClient.get<IBudget[]>('/expensify/budgets', {
        params: { startDate, endDate },
      });

      return response.data;
    },
  });

  useEffect(() => {
    refetch();
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, -1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };


  const refetchData = (customDate?: Date) => {
    if (customDate) {
      setCurrentMonth(customDate);
    } else {
      setCurrentMonth((prev) => new Date(prev));
    }
  };

  return {
    budgets: budgets || [],
    loading: isLoading,
    currentMonth: format(currentMonth, 'MMMM yyyy'),
    currentDate: currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    refetch: refetchData,
    refetchManual: refetch,
  };
};


export default useBudgetsForMonth;
