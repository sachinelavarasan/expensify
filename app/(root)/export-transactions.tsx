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
import Spacer from '@/components/Spacer';
import {
  useExportExcelTransactions,
  useExportPdfTransactions,
} from '@/hooks/useExportTransactions';
import CustomRadioButton from '@/components/CustomRadioButton';
import { exportType, transactionExportType } from '@/utils/common-data';
import DatePickerWithOutValue from '@/components/DatePickerWithOutValue';
import { AntDesign, Entypo } from '@expo/vector-icons';

export default function ExportData() {
  const { mutateAsync: exportExcelMutation, isPending } = useExportExcelTransactions();
  const { mutateAsync: exportPdfMutation, isPending: isPdfLoading } = useExportPdfTransactions();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [docType, setDoctype] = useState<number | string>('pdf');
  const [tranType, setTranType] = useState<string>('all');

  async function download() {
    if (!start || !end) {
      return;
    }
    switch (docType) {
      case 'xlsx':
        exportExcelMutation({
          startDate: start,
          endDate: end,
          fileType: 'xlsx',
          tranType,
        }).then(() => {
          setEnd('');
          setStart('');
        });
        break;
      case 'csv':
        exportExcelMutation({
          startDate: start,
          endDate: end,
          fileType: 'csv',
          tranType,
        }).then(() => {
          setEnd('');
          setStart('');
        });
        break;
      default:
        exportPdfMutation({
          startDate: start,
          endDate: end,
          tranType,
        }).then(() => {
          setEnd('');
          setStart('');
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
            <Spacer height={20} />
            <View style={{ alignItems: 'flex-start' }}>
              <View style={[styles.card, { width: '100%' }]}>
                <DatePickerWithOutValue
                  label="From:"
                  onChange={(data: string) => setStart(data)}
                  value={start}
                  placeholder="Start date"
                />
                <Spacer height={5} />
                <AntDesign name="arrowdown" size={24} color="#6900FF" />
                <Spacer height={5} />
                <DatePickerWithOutValue
                  label="To:"
                  onChange={(data: string) => setEnd(data)}
                  value={end}
                  placeholder="End date"
                  minimumDate={start}
                />
              </View>
            </View>
            <Spacer height={20} />
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
            <Spacer height={20} />
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
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.logoutBg,
                  isPdfLoading || isPending ? styles.disable : '',
                ]}
                onPress={download}>
                {isPdfLoading || isPending ? (
                  <ActivityIndicator animating color={'#FFF'} style={styles.loader} />
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
    opacity: 0.6,
  },
  textDisable: { opacity: 0 },
  loader: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
