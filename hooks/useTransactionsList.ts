import { useEffect, useState } from 'react';
import { format, startOfMonth, addMonths } from 'date-fns';
import { Itransaction } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const queryKeys = {
  transactions: ['transactions'] as const,
};

const useMonthlyTransactions = (initialDate?: Date) => {
  const [currentMonth, setCurrentMonth] = useState(initialDate || new Date());
  const [search, setSearch] = useState('');
  const [transactionType, setTransactionType] = useState<string>('');
  const { getToken, userId } = useAuth();

  const {
    isLoading,
    data: transactions,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.transactions, currentMonth, search, transactionType],
    queryFn: async ({ queryKey }): Promise<Itransaction[]> => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const queryDate = queryKey[1] as Date;
      const searchText = queryKey[2] as string;
      const txType = queryKey[3] as string;

      const start = startOfMonth(queryDate);
      const end = addMonths(start, 1);

      const startDate = format(start, 'yyyy-MM-dd');
      const endDate = format(end, 'yyyy-MM-dd');
      let url = `${API_URL}/expensify/transactions?startDate=${startDate}&endDate=${endDate}`;

      if (searchText) url += `&search=${searchText}`;
      if (txType) url += `&transaction_type=${txType}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

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

  const updateSearch = (newSearch: string) => setSearch(newSearch);
  const updateTransactionType = (type: string) => setTransactionType(type);

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
    search,
    transactionType,
    goToPreviousMonth,
    goToNextMonth,
    updateSearch,
    updateTransactionType,
    refetch: refetchData,
    refetchManual: refetch,
  };
};

export default useMonthlyTransactions;
