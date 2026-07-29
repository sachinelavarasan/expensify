import { useMemo } from 'react';
import { BankAccount } from '@/types';

export function useNetWorth(accounts: BankAccount[]) {
  return useMemo(() => {
    const netWorth = accounts
      .filter((acc) => acc.exp_ba_is_active && !acc.exp_ba_is_deleted)
      .reduce((sum, acc) => sum + (parseFloat(acc.exp_ba_balance) || 0), 0);
    return { netWorth };
  }, [accounts]);
}
