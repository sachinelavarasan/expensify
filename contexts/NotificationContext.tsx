import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { Subscription } from 'expo-notifications';
import { useRouter } from 'expo-router';
import { registerForPushNotificationsAsync } from '../utils/registerForPushNotificationsAsync';

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const notificationListener = useRef<Subscription | null>(null);
  const responseListener = useRef<Subscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => {
        setExpoPushToken(token)
      },
      (error) => setError(error),
    );

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('🔔 Notification Received: ', notification);
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(
        '🔔 Notification Response: ',
        JSON.stringify(response, null, 2),
        JSON.stringify(response.notification.request.content.data, null, 2),
      );

      const data = response.notification.request.content.data as {
        type?: string;
        recurringId?: string | number;
        title?: string;
        amount?: string | number;
        categoryId?: string | number;
        transactionTypeId?: string | number;
        bankAccountId?: string | number;
      };
      if (data?.type === 'recurring-transaction-due') {
        router.push({
          pathname: '/transaction',
          params: {
            recurring_title: String(data.title ?? ''),
            recurring_amount: String(data.amount ?? ''),
            recurring_category_id: String(data.categoryId ?? ''),
            recurring_transaction_type_id: String(data.transactionTypeId ?? ''),
            recurring_bank_account_id: String(data.bankAccountId ?? ''),
          },
        });
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification, error }}>
      {children}
    </NotificationContext.Provider>
  );
};
