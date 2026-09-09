import * as Notifications from 'expo-notifications';

import { apiClient } from '@/lib/apiClient';
import { registerForPushNotificationsCheck } from '@/utils/registerForPushNotificationsAsync';
import { IRecurringTransaction } from '@/types';

const IDENTIFIER_PREFIX = 'planned-reminder:';
const DEFAULT_TIME = '08:00 AM';

function parseTime(time: string): { hour: number; minute: number } {
  const [timePart, meridian] = time.split(' ');
  let [hour, minute] = timePart.split(':').map(Number);
  if (meridian === 'PM' && hour !== 12) hour += 12;
  if (meridian === 'AM' && hour === 12) hour = 0;
  return { hour, minute };
}

// Native recurring triggers - the OS re-fires these on its own schedule
// indefinitely, so a payment reminder keeps advancing even if the app is
// never reopened (unlike a one-shot date computed and rescheduled per sync).
function buildRecurringTrigger(
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
  startDate: string,
  time: string,
): Notifications.SchedulableNotificationTriggerInput {
  const { hour, minute } = parseTime(time);
  const start = new Date(`${startDate}T00:00:00`);

  switch (frequency) {
    case 'daily':
      return { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute };
    case 'weekly':
      return {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: start.getDay() + 1, // 1-7, 1 = Sunday
        hour,
        minute,
      };
    case 'monthly':
      return {
        type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
        day: start.getDate(),
        hour,
        minute,
      };
    case 'yearly':
      return {
        type: Notifications.SchedulableTriggerInputTypes.YEARLY,
        day: start.getDate(),
        month: start.getMonth(), // 0-indexed
        hour,
        minute,
      };
  }
}

function hasExpired(endDate: string | null, now: Date): boolean {
  if (!endDate) return false;
  const end = new Date(`${endDate}T23:59:59`);
  return end < now;
}

// Pass `recurringId` to touch only that transaction's reminder (used after
// add/edit/delete, so unrelated reminders are never cancelled/rescheduled).
// Omit it for a full resync of everything (used on login/app-foreground,
// where any item could need catching up - e.g. an expired end date that
// needs its notification cancelled).
export async function syncPlannedPaymentReminders(recurringId?: string): Promise<void> {
  try {
    const granted = await registerForPushNotificationsCheck();
    if (!granted) return;

    const res = await apiClient.get<IRecurringTransaction[]>('/expensify/recurring-transactions');
    const recurringTransactions = recurringId
      ? (res.data || []).filter((rt) => rt.exp_rt_id === recurringId)
      : res.data || [];

    const now = new Date();
    const desired = new Map<string, IRecurringTransaction>();

    for (const rt of recurringTransactions) {
      if (!rt.exp_rt_is_active || !rt.exp_rt_reminder_enabled) continue;
      if (hasExpired(rt.exp_rt_end_date, now)) continue;
      desired.set(`${IDENTIFIER_PREFIX}${rt.exp_rt_id}`, rt);
    }

    const relevantPrefix = recurringId ? `${IDENTIFIER_PREFIX}${recurringId}` : IDENTIFIER_PREFIX;
    const existing = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      existing
        .filter((n) => n.identifier.startsWith(relevantPrefix))
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );

    await Promise.all(
      Array.from(desired.entries()).map(([identifier, rt]) =>
        Notifications.scheduleNotificationAsync({
          identifier,
          content: {
            title: `${rt.exp_tt_label} due today: ${rt.exp_rt_title}`,
            body: `${rt.exp_rt_amount} · ${rt.exp_tc_label}`,
            data: { type: 'planned-payment-reminder', recurringId: rt.exp_rt_id },
          },
          trigger: buildRecurringTrigger(
            rt.exp_rt_frequency,
            rt.exp_rt_start_date,
            rt.exp_rt_reminder_time || DEFAULT_TIME,
          ),
        }),
      ),
    );
  } catch (error) {
    console.error('Failed to sync planned payment reminders', error);
  }
}
