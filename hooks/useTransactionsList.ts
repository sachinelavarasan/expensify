import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { startOfDay, addDays, startOfWeek, addWeeks, startOfMonth, addMonths, format } from 'date-fns';
import { useAuth } from '@clerk/clerk-expo';
import { Itransaction } from '@/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type DateRangeType = 'daily' | 'weekly' | 'monthly';

const useTransactions = (initialDate?: Date, initialRange: DateRangeType = 'monthly') => {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>(initialRange);
  const [search, setSearch] = useState('');
  const [transactionType, setTransactionType] = useState<string>('');
  const [bankAccount, setBankAccount] = useState<number | string>('');
  const { getToken, userId } = useAuth();

  const {
    isLoading,
    data: transactions,
    refetch,
  } = useQuery({
    queryKey: ['transactions', currentDate, search, transactionType, dateRangeType, bankAccount],
    queryFn: async ({ queryKey }): Promise<Itransaction[]> => {
      const token = await getToken();
      if (!userId) throw new Error('User is not authenticated');

      const [_, date, searchText, txType, rangeType] = queryKey as [string, Date, string, string, DateRangeType];

      let start: Date;
      let end: Date;

      if (rangeType === 'daily') {
        start = startOfDay(date);
        end = addDays(start, 1);
      } else if (rangeType === 'weekly') {
        start = startOfWeek(date, { weekStartsOn: 1 });
        end = addWeeks(start, 1);
      } else {
        start = startOfMonth(date);
        end = addMonths(start, 1);
      }

      const startDate = format(start, 'yyyy-MM-dd');
      const endDate = format(end, 'yyyy-MM-dd');

      let url = `${API_URL}/expensify/transactions?startDate=${startDate}&endDate=${endDate}`;
      if (searchText) url += `&search=${searchText}`;
      if (txType) url += `&transaction_type=${txType}`;
      if (bankAccount) url += `&account=${bankAccount}`;

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
  }, [currentDate, dateRangeType, bankAccount]);

  const goToPrevious = () => {
    setCurrentDate((prev) => {
      if (dateRangeType === 'daily') return addDays(prev, -1);
      if (dateRangeType === 'weekly') return addWeeks(prev, -1);
      return addMonths(prev, -1); // monthly
    });
  };

  const goToNext = () => {
    setCurrentDate((prev) => {
      if (dateRangeType === 'daily') return addDays(prev, 1);
      if (dateRangeType === 'weekly') return addWeeks(prev, 1);
      return addMonths(prev, 1); // monthly
    });
  };

  const updateSearch = (newSearch: string) => setSearch(newSearch);
  const updateTransactionType = (type: string) => setTransactionType(type);
  const updateDateRangeType = (range: DateRangeType) => setDateRangeType(range);
  const updateBankAccount = (account: number | string) => setBankAccount(account);

  const refetchData = (customDate?: Date) => {
    if (customDate) {
      setCurrentDate(customDate);
    } else {
      setCurrentDate((prev) => new Date(prev));
    }
  };

  const getFormattedTitle = () => {
    if (dateRangeType === 'daily') return format(currentDate, 'dd MMM yyyy');
    if (dateRangeType === 'weekly') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = addDays(start, 6);
      return `${format(start, 'MMM dd, yy')} - ${format(end, 'MMM dd, yy')}`;
    }
    return format(currentDate, 'MMMM yyyy');
  };

  return {
    transactions: transactions || [],
    loading: isLoading,
    currentDate,
    search,
    transactionType,
    dateRangeType,
    bankAccount,
    goToPrevious,
    goToNext,
    updateSearch,
    updateTransactionType,
    updateDateRangeType,
    refetch: refetchData,
    refetchManual: refetch,
    updateBankAccount,
    formattedTitle: getFormattedTitle(),
  };
};
export default useTransactions;