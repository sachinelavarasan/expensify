import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  parseISO,
  startOfDay,
} from 'date-fns';

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

const ADVANCE_BY: Record<'daily' | 'weekly' | 'monthly' | 'yearly', (date: Date) => Date> = {
  daily: (d) => addDays(d, 1),
  weekly: (d) => addWeeks(d, 1),
  monthly: (d) => addMonths(d, 1),
  yearly: (d) => addYears(d, 1),
};

// Computes the next occurrence on/after `now` from start date + frequency,
// stepping forward locally instead of relying on the backend's
// exp_rt_next_due_date rollover (which only advances when an external cron
// hits the server - not something local reminders should depend on).
// Returns null once the series has passed its end date.
export function getNextOccurrenceDate(
  startDate: string,
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
  endDate: string | null,
  now: Date = new Date(),
): Date | null {
  const advance = ADVANCE_BY[frequency];
  const end = endDate ? parseISO(`${endDate}T23:59:59`) : null;
  const todayStart = startOfDay(now);
  let occurrence = parseISO(`${startDate}T00:00:00`);

  let guard = 0;
  while (occurrence < todayStart) {
    occurrence = advance(occurrence);
    if (end && occurrence > end) return null;
    if (++guard > 10000) return null;
  }
  return end && occurrence > end ? null : occurrence;
}
