import { useEffect, useState } from 'react';
import { format, startOfMonth, addMonths } from 'date-fns';
import { IBudget } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const queryKeys = {
  budget: ['budgets'] as const,
};

const useBudgetsForMonth = (initialDate?: Date) => {
  const [currentMonth, setCurrentMonth] = useState(initialDate || new Date());
  const { getToken, userId } = useAuth();

  const {
    isLoading,
    data: budgets,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.budget, currentMonth],
    queryFn: async ({ queryKey }): Promise<IBudget[]> => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const queryDate = queryKey[1] as Date;

      const start = startOfMonth(queryDate);
      const end = addMonths(start, 1);

      const startDate = format(start, 'yyyy-MM-dd');
      const endDate = format(end, 'yyyy-MM-dd');
      let url = `${API_URL}/expensify/budgets?startDate=${startDate}&endDate=${endDate}`;


      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as IBudget[];
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
