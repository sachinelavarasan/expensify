import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';

import { ThemedView } from '@/components/ThemedView';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import ProfileHeader from '@/components/ProfileHeader';
import CustomDatePicker from '@/components/CustomDatePicker';
import Spacer from '@/components/Spacer';
import {
  useExportExcelTransactions,
  useExportPdfTransactions,
} from '@/hooks/useExportTransactions';
import CustomRadioButton from '@/components/CustomRadioButton';
import { exportType, transactionExportType } from '@/utils/common-data';

export default function ExportData() {
  const { mutateAsync: exportExcelMutation, isPending } = useExportExcelTransactions();
  const { mutateAsync: exportPdfMutation, isPending: isPdfLoading } = useExportPdfTransactions();
  const [start, setStart] = useState('');
  const [second, setSecond] = useState('');
  const [docType, setDoctype] = useState<number | string>('pdf');
  const [tranType, setTranType] = useState<string>('all');

  async function download() {
    if (!start || !second) {
      return;
    }
    switch (docType) {
      case 'xlsx':
        exportExcelMutation({
          startDate: start,
          endDate: second,
          fileType: 'xlsx',
          tranType,
        });
        break;
      case 'csv':
        exportExcelMutation({
          startDate: start,
          endDate: second,
          fileType: 'csv',
          tranType,
        });
        break;
      default:
        exportPdfMutation({
          startDate: start,
          endDate: second,
          tranType,
        });
        break;
    }
  }

  return (
    <KeyboardAvoidingView
      {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
      style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          <ProfileHeader title="Export Transactions" />
          <ThemedView
            style={{
              flex: 1,
              paddingHorizontal: 20,
            }}>
            <Spacer height={10} />
            <View style={{ alignItems: 'flex-start' }}>
              <View style={{ width: 220 }}>
                <CustomDatePicker
                  label="From Date"
                  onChange={(data) => setStart(data)}
                  value={start}
                  placeholder="From Date"
                  isRequired
                />
                <Spacer height={15} />
                <CustomDatePicker
                  label="To Date"
                  onChange={(data) => setSecond(data)}
                  value={second}
                  placeholder="To Date"
                  minimumDate={start}
                  isRequired
                />
              </View>
            </View>
            <Spacer height={30} />
            <View style={styles.card}>
              <CustomRadioButton
                label="Format"
                value={docType}
                options={exportType}
                onChange={(data) => {
                  setDoctype(data);
                }}
              />
            </View>
            <Spacer height={15} />
            <View style={styles.card}>
              <CustomRadioButton
                label="Transaction Type"
                value={tranType}
                options={transactionExportType}
                onChange={(data) => {
                  setTranType(String(data));
                }}
              />
            </View>
            <View style={[styles.btnContainer, { paddingHorizontal: 5 }]}>
              <TouchableOpacity style={[styles.button, styles.logoutBg]} onPress={download}>
                {isPdfLoading || isPending ? (
                  <ActivityIndicator animating color={'#1C1C29'} style={styles.loader} />
                ) : null}
                <Text style={[styles.title, isPdfLoading || isPending ? styles.textDisable : {}]}>
                  Export Now
                </Text>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </ScrollView>
      </SafeAreaViewComponent>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  btnContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#6900FF',
    borderRadius: 8,
    paddingVertical: Platform.OS === 'android' ? 10 : 16,
    width: '100%',
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter-600',
  },
  logoutBg: {
    backgroundColor: '#282343',
  },
  card: {
    borderColor: '#5a4f96',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  disable: {
    opacity: 0.4,
  },
  textDisable: { opacity: 0 },
  loader: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
