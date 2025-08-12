import { setAsyncValue } from '@/utils/functions';
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsCheck } from '@/utils/registerForPushNotificationsAsync';
import { format } from 'date-fns';
import * as Notifications from 'expo-notifications';

export function useReminderSettings() {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    (async () => {
      const storedEnabled = await AsyncStorage.getItem('reminder-enable');
      const storedTime = await AsyncStorage.getItem('reminder-time');
      if (storedEnabled !== null) setEnabled(JSON.parse(storedEnabled));
      if (storedTime !== null) setTime(storedTime);
    })();
  }, []);

  const scheduleNotification = useCallback(async (times?: string) => {
    try {
      const enabledNotification = await registerForPushNotificationsCheck();
      if (!enabledNotification) {
        setEnabled(true);
        setEnabled(false);
        await AsyncStorage.setItem('reminder-enable', JSON.stringify(false));
        await AsyncStorage.removeItem('reminder-time');
        const existing = await Notifications.getAllScheduledNotificationsAsync();
        for (const n of existing) {
          if (n.identifier === 'Reminder') {
            await Notifications.cancelScheduledNotificationAsync(n.identifier);
            console.log(`Cancelled existing notification: ${n.identifier}`);
          }
        }
        return;
      }
      const date = new Date();

      let hour: number;
      let minute: number;
      let displayTime: string;

      if (times) {
        const [timePart, meridian] = times.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);

        if (meridian === 'PM' && hours !== 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;

        hour = hours;
        minute = minutes;
        displayTime = times;
      } else {
        hour = date.getHours();
        minute = date.getMinutes();
        displayTime = format(date, 'hh:mm a');
      }

      const scheduleDate = new Date();
      scheduleDate.setHours(hour, minute, 0, 0);

      if (scheduleDate <= new Date()) {
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }

      const existing = await Notifications.getAllScheduledNotificationsAsync();
      for (const n of existing) {
        if (n.identifier === 'Reminder') {
          await Notifications.cancelScheduledNotificationAsync(n.identifier);
          console.log(`Cancelled existing notification: ${n.identifier}`);
        }
      }

      await Notifications.scheduleNotificationAsync({
        identifier: 'Reminder',
        content: {
          title: 'Today Reminder 🔔',
          body: "You have expenses to log for today. Don't forget to keep your budget on track!",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: scheduleDate.getHours(),
          minute: scheduleDate.getMinutes(),
        },
      });

      await AsyncStorage.setItem('reminder-time', displayTime);
      await AsyncStorage.setItem('reminder-enable', JSON.stringify(true));

      console.log(`Scheduled notification for ${displayTime}`);
    } catch (error) {
      console.error('Failed to schedule reminder', error);
    }
  }, []);

  const disableNotification = useCallback(async () => {
    await setAsyncValue('reminder-enable', JSON.stringify(false));
    await AsyncStorage.removeItem('reminder-time');
    await Notifications.cancelAllScheduledNotificationsAsync();
    setEnabled(false);
    setTime('');
  }, []);

  return {
    enabled,
    time,
    scheduleNotification,
    disableNotification,
  };
}
