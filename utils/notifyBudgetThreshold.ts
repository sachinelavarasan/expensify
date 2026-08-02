import { format, startOfMonth, addMonths } from 'date-fns';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';

import { apiClient } from '@/lib/apiClient';
import { getAsyncValue, setAsyncValue } from '@/utils/functions';
import { registerForPushNotificationsCheck } from '@/utils/registerForPushNotificationsAsync';
import { getCategoryBudgetStatus } from '@/utils/budgetAlerts';
import { IBudget } from '@/types';

async function fetchCurrentMonthBudgets(): Promise<IBudget[]> {
  const start = startOfMonth(new Date());
  const end = addMonths(start, 1);
  const res = await apiClient.get<IBudget[]>('/expensify/budgets', {
    params: { startDate: format(start, 'yyyy-MM-dd'), endDate: format(end, 'yyyy-MM-dd') },
  });
  return res.data;
}

// Local on-device notification only (expo-notifications' scheduleNotificationAsync with
// trigger: null, same as hooks/useReminder.ts but firing immediately instead of daily) -
// no push token, no expo-server-sdk, no round-trip through the API's notification tables.
export async function notifyBudgetThresholdIfCrossed(categoryId: string | undefined) {
  if (!categoryId) return;

  try {
    const budgets = await fetchCurrentMonthBudgets();
    const status = getCategoryBudgetStatus(budgets, categoryId);
    if (!status) return;

    const monthKey = format(new Date(), 'yyyy-MM');
    const tier = status.exceeded ? 'exceeded' : 'warning';
    const guardKey = `budget-alert-notified:${categoryId}:${monthKey}:${tier}`;
    if (await getAsyncValue(guardKey)) return;

    const granted = await registerForPushNotificationsCheck();
    if (!granted) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    await Notifications.scheduleNotificationAsync({
      identifier: `${guardKey}-${Date.now()}`,
      content: {
        title: status.exceeded ? 'Budget exceeded' : 'Budget alert',
        body: status.exceeded
          ? `${status.category} has exceeded its budget this month.`
          : `${status.category} is at ${status.percentage.toFixed(0)}% of budget this month.`,
      },
      trigger: null,
    });

    await setAsyncValue(guardKey, JSON.stringify(true));
  } catch (error) {
    console.error('Failed to evaluate budget threshold notification', error);
  }
}
