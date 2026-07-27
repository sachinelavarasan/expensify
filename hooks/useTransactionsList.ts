import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { startOfDay, addDays, startOfWeek, addWeeks, startOfMonth, addMonths, format } from 'date-fns';
import { apiClient } from '@/lib/apiClient';
import { Itransaction } from '@/types';

type DateRangeType = 'daily' | 'weekly' | 'monthly';

const useTransactions = (
  initialDate?: Date,
  initialRange: DateRangeType = 'monthly',
  enabled: boolean = true,
) => {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>(initialRange);
  const [search, setSearch] = useState('');
  const [transactionType, setTransactionType] = useState<string>('');
  const [bankAccount, setBankAccount] = useState<number | string>('');

  const {
    isLoading,
    data: transactions,
    refetch,
  } = useQuery({
    queryKey: ['transactions', currentDate, search, transactionType, dateRangeType, bankAccount],
    enabled,
    queryFn: async ({ queryKey }): Promise<Itransaction[]> => {
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

      const response = await apiClient.get<Itransaction[]>('/expensify/transactions', {
        params: {
          startDate,
          endDate,
          search: searchText || undefined,
          transaction_type: txType || undefined,
          account: bankAccount || undefined,
        },
      });

      return response.data;
    },
  });

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
      refetch();
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
