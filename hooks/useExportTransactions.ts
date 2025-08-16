import { useAuth } from '@clerk/clerk-expo';
import { useMutation } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system';
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
}

export const useExportExcelTransactions = () => {
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async ({
      startDate,
      endDate,
      fileType = 'xlsx',
      tranType = 'all',
    }: ExportParams) => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const url = `${API_URL}/expensify/export-excel?format=${fileType}&startDate=${startDate}&endDate=${endDate}&transaction_type=${tranType}`;
      const response = await fetch(url, {
        method: 'GET',

        headers: {
          Accept: MIME_TYPES[fileType],
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 204) {
        Alert.alert('No Data', 'No transactions found for the selected date range.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();

      const reader = new FileReader();
      const base64Data: string = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          resolve((reader.result as string).split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const timestamp = format(now, 'yyyy-MM-dd-HH-mm-ss');
      const extension = fileType === 'csv' ? 'csv' : 'xlsx';
      const filename = `transactions-${timestamp}.${extension}`;
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await saveFile(fileUri, filename, MIME_TYPES[fileType]);
    },
  });
};

export const useExportPdfTransactions = () => {
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async ({
      startDate,
      endDate,
      tranType = 'all',
    }: {
      startDate: string;
      endDate: string;
      tranType?: string;
    }) => {
      const token = await getToken();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const url = `${API_URL}/expensify/export-pdf?startDate=${startDate}&endDate=${endDate}&transaction_type=${tranType}`;
      const response = await fetch(url, {
        method: 'GET',

        headers: {
          Accept: 'application/pdf',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 204) {
        Alert.alert('No Data', 'No transactions found for the selected date range.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();

      const reader = new FileReader();
      const base64Data: string = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          resolve((reader.result as string).split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const filename = `transactions-${format(now, 'yyyy-MM-dd-HH-mm-ss')}.pdf`;

      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

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
