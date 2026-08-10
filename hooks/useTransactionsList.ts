import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { startOfDay, addDays, startOfWeek, addWeeks, startOfMonth, addMonths, format } from 'date-fns';
import { apiClient } from '@/lib/apiClient';
import { Itransaction } from '@/types';

type DateRangeType = 'daily' | 'weekly' | 'monthly';
type CustomDateRange = { start: string; end: string };

const useTransactions = (
  initialDate?: Date,
  initialRange: DateRangeType = 'monthly',
  enabled: boolean = true,
) => {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>(initialRange);
  const [search, setSearch] = useState('');
  const [transactionType, setTransactionType] = useState<string>('');
  const [bankAccount, setBankAccount] = useState<(number | string)[]>([]);
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange | null>(null);
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const {
    isLoading,
    data: transactions,
    refetch,
  } = useQuery({
    queryKey: [
      'transactions',
      currentDate,
      search,
      transactionType,
      dateRangeType,
      bankAccount,
      customDateRange,
      minAmount,
      maxAmount,
      categoryIds,
      tags,
    ],
    enabled,
    queryFn: async ({ queryKey }): Promise<Itransaction[]> => {
      const [_, date, searchText, txType, rangeType] = queryKey as [string, Date, string, string, DateRangeType];

      let startDate: string;
      let endDate: string;

      if (customDateRange) {
        startDate = customDateRange.start;
        endDate = customDateRange.end;
      } else {
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

        startDate = format(start, 'yyyy-MM-dd');
        endDate = format(end, 'yyyy-MM-dd');
      }

      const response = await apiClient.get<Itransaction[]>('/expensify/transactions', {
        params: {
          startDate,
          endDate,
          search: searchText || undefined,
          transaction_type: txType || undefined,
          account: bankAccount.length ? bankAccount.join(',') : undefined,
          minAmount: minAmount || undefined,
          maxAmount: maxAmount || undefined,
          categories: categoryIds.length ? categoryIds.join(',') : undefined,
          tags: tags.length ? tags.join(',') : undefined,
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
  const updateBankAccount = (account: (number | string)[]) => setBankAccount(account);
  const updateCustomDateRange = (range: CustomDateRange) => setCustomDateRange(range);
  const clearCustomDateRange = () => setCustomDateRange(null);
  const updateMinAmount = (value: string) => setMinAmount(value);
  const updateMaxAmount = (value: string) => setMaxAmount(value);
  const updateCategoryIds = (ids: string[]) => setCategoryIds(ids);
  const updateTags = (newTags: string[]) => setTags(newTags);

  // Memoized so consumers that put this in a useCallback/useEffect dependency
  // array (e.g. stats.tsx's useFocusEffect) get a stable reference - without
  // this, a fresh function identity on every render makes useFocusEffect
  // re-run its effect on every re-render while focused (not just on focus),
  // which calls refetch() again, causing another render, another new
  // reference, another refetch... a self-sustaining loop that never lets the
  // query settle, showing as a stuck loading overlay.
  const refetchData = useCallback(
    (customDate?: Date) => {
      if (customDate) {
        setCurrentDate(customDate);
      } else {
        refetch();
      }
    },
    [refetch],
  );

  const getFormattedTitle = () => {
    if (customDateRange) {
      return `${format(new Date(customDateRange.start), 'MMM dd, yy')} - ${format(new Date(customDateRange.end), 'MMM dd, yy')}`;
    }
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
    customDateRange,
    minAmount,
    maxAmount,
    categoryIds,
    tags,
    goToPrevious,
    goToNext,
    updateSearch,
    updateTransactionType,
    updateDateRangeType,
    refetch: refetchData,
    refetchManual: refetch,
    updateBankAccount,
    updateCustomDateRange,
    clearCustomDateRange,
    updateMinAmount,
    updateMaxAmount,
    updateCategoryIds,
    updateTags,
    formattedTitle: getFormattedTitle(),
  };
};
export default useTransactions;
