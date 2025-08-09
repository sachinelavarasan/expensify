import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { IExpUser } from '@/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const useEnableNotificationToken = () => {
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (data: { token: string; time: string }) => {
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      if (!data.token) throw new Error('Notification token not found');

      const authToken = await getToken();

      const res = await fetch(`${API_URL}/expensify/enable-notification`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data }),
      });

      if (!res.ok) throw new Error('Failed to enable notification');

      return await res.json();
    },

    onSuccess: () => {
      console.log('Notification token enabled');
    },

    onError: (err) => {
      console.error('Enable token error:', (err as Error).message);
    },
  });
};

export const useDisableNotificationToken = () => {
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      if (!token) throw new Error('Notification token not found');

      const authToken = await getToken();

      const res = await fetch(`${API_URL}/expensify/disable-notification`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });


      if (!res.ok) throw new Error('Failed to enable notification');

      return await res.json();
    },

    onSuccess: () => {
      console.log('Notification token disabled');
    },

    onError: (err) => {
      console.error('Disable token error:', (err as Error).message);
    },
  });
};

export const useUserSettingChanges = () => {
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<IExpUser>) => {
      if (!userId) {
        throw new Error('User is not authenticated');
      }

      const authToken = await getToken();

      const res = await fetch(`${API_URL}/expensify/setting-changes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data }),
      });

      if (!res.ok) throw new Error('Failed to update user setting');

      return await res.json();
    },

    onSuccess: () => {
      console.log('Setting has been updated');
    },

    onError: (err) => {
      console.error('Setting update error:', (err as Error).message);
    },
  });
};
