import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { IExpUser } from '@/types';

export const useEnableNotificationToken = () => {
  return useMutation({
    mutationFn: async (data: { token: string }) => {
      if (!data.token) throw new Error('Notification token not found');

      const res = await apiClient.post('/expensify/enable-notification', data);
      return res.data;
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
  return useMutation({
    mutationFn: async (token: string) => {
      if (!token) throw new Error('Notification token not found');

      const res = await apiClient.put('/expensify/disable-notification', { token });
      return res.data;
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
  return useMutation({
    mutationFn: async (data: Partial<IExpUser>) => {
      const res = await apiClient.post('/expensify/setting-changes', data);
      return res.data;
    },

    onSuccess: () => {
      console.log('Setting has been updated');
    },

    onError: (err) => {
      console.error('Setting update error:', (err as Error).message);
    },
  });
};
