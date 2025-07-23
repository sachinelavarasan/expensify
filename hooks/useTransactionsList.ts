import { useEffect, useState } from 'react';
import { format, startOfMonth, addMonths } from 'date-fns';
import { Itransaction } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const queryKeys = {
  transaction: ['transaction'] as const,
};

const useMonthlyTransactions = (initialDate?: Date) => {
  const [currentMonth, setCurrentMonth] = useState(initialDate || new Date());
  const { getToken, userId } = useAuth();

  if (!userId) {
    throw new Error('User is not authenticated');
  }

  const {
    isLoading,
    data: transactions,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.transaction, currentMonth],
    queryFn: async ({ queryKey }): Promise<Itransaction[]> => {
      const token = await getToken();
      const queryDate = queryKey[1] as Date;

      const start = startOfMonth(queryDate);
      const end = addMonths(start, 1);

      const startDate = format(start, 'yyyy-MM-dd');
      const endDate = format(end, 'yyyy-MM-dd');

      const response = await fetch(
        `${API_URL}/expensify/transactions?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as Itransaction[];
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
    transactions: transactions || [],
    loading: isLoading,
    currentMonth: format(currentMonth, 'MMMM yyyy'),
    currentDate: currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    refetch: refetchData,
  };
};

export default useMonthlyTransactions;
