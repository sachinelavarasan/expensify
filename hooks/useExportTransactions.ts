import { apiClient } from '@/lib/apiClient';
import { getAccessToken } from '@/lib/tokenStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { format } from 'date-fns';

const now = new Date();

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const MIME_TYPES = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
};

interface ExportParams {
  startDate: string;
  endDate: string;
  fileType?: 'xlsx' | 'csv';
  tranType?: string;
  // Omit (or leave undefined) to include every account - only sent when the
  // selection is a strict subset, so the default "all accounts" case doesn't
  // grow the query string for no reason.
  accountIds?: string[];
}

export const useExportExcelTransactions = () => {
  return useMutation({
    mutationFn: async ({
      startDate,
      endDate,
      fileType = 'xlsx',
      tranType = 'all',
      accountIds,
    }: ExportParams) => {
      const token = getAccessToken();
      const url =
        `${API_URL}/expensify/export-excel?format=${fileType}&startDate=${startDate}&endDate=${endDate}&transaction_type=${tranType}` +
        (accountIds?.length ? `&accountIds=${encodeURIComponent(accountIds.join(','))}` : '');

      const timestamp = format(now, 'yyyy-MM-dd-HH-mm-ss');
      const extension = fileType === 'csv' ? 'csv' : 'xlsx';
      const filename = `transactions-${timestamp}.${extension}`;
      const fileUri = FileSystem.documentDirectory + filename;

      const { status } = await FileSystem.downloadAsync(url, fileUri, {
        headers: {
          Accept: MIME_TYPES[fileType],
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (status === 204) {
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
        Alert.alert('No Data', 'No transactions found for the selected date range.');
        return;
      }

      if (status !== 200) {
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
        throw new Error('Failed to download file');
      }

      await saveFile(fileUri, filename, MIME_TYPES[fileType]);
    },
  });
};

export const useExportPdfTransactions = () => {
  return useMutation({
    mutationFn: async ({
      startDate,
      endDate,
      tranType = 'all',
      accountIds,
    }: {
      startDate: string;
      endDate: string;
      tranType?: string;
      accountIds?: string[];
    }) => {
      const token = getAccessToken();
      const url =
        `${API_URL}/expensify/export-pdf?startDate=${startDate}&endDate=${endDate}&transaction_type=${tranType}` +
        (accountIds?.length ? `&accountIds=${encodeURIComponent(accountIds.join(','))}` : '');

      const filename = `transactions-${format(now, 'yyyy-MM-dd-HH-mm-ss')}.pdf`;
      const fileUri = FileSystem.documentDirectory + filename;

      const { status } = await FileSystem.downloadAsync(url, fileUri, {
        headers: {
          Accept: 'application/pdf',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (status === 204) {
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
        Alert.alert('No Data', 'No transactions found for the selected date range.');
        return;
      }

      if (status !== 200) {
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
        throw new Error('Failed to download file');
      }

      await saveFile(fileUri, filename, 'application/pdf');
    },
  });
};

async function saveFile(uri: string, filename: string, mimetype: string) {
  if (Platform.OS === 'android') {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (permissions.granted) {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        filename,
        mimetype,
      )
        .then(async (url) => {
          await FileSystem.writeAsStringAsync(url, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          Alert.alert(
            'Download Complete',
            'Your transaction report has been successfully downloaded and saved to your device.',
            [{ text: 'OK', style: 'default' }],
          );
        })
        .catch((e) =>
          Alert.alert(
            'Save Failed',
            'An error occurred while saving the transaction report. Please try again.',
            [{ text: 'OK', style: 'default' }],
          ),
        );
    } else {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing not available');
      }
      await Sharing.shareAsync(uri);
    }
  }
}


interface ExcelPayload {
  headers: any;
  data: any[];
}

export const useImportExcel = () => {
  return useMutation({
    mutationFn: async (payload: ExcelPayload) => {
      const res = await apiClient.post('/expensify/import-data', payload);
      return res.data;
    },
  });
};
export const useImportBulkTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ExcelPayload) => {
      const res = await apiClient.post('/expensify/bulk-transactions', payload);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      return res.data;
    },
  });
};
