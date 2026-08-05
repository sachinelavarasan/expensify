import { differenceInCalendarDays, parseISO } from 'date-fns';

export const RECURRING_DUE_SOON_DAYS = 7;

export function getDaysUntilDue(dateStr: string): number {
  return differenceInCalendarDays(parseISO(dateStr), new Date());
}

export function toMonthlyAmount(
  amount: number,
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
): number {
  switch (frequency) {
    case 'daily':
      return amount * 30;
    case 'weekly':
      return amount * (52 / 12);
    case 'yearly':
      return amount / 12;
    default:
      return amount;
  }
}
