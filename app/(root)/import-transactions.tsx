import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';

import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import Spacer from '@/components/Spacer';
import ProfileHeader from '@/components/ProfileHeader';
import { CustomSelectInput } from '@/components/CustomSelectInput';
import { formatToCurrency } from '@/utils/formatter';
import { useImportBulkTransaction, useImportExcel } from '@/hooks/useExportTransactions';
import { useGetUserBankAccounts } from '@/hooks/useBankAccountOperation';
import { showToast } from '@/components/ToastMessage';
import { useThemeContext } from '@/contexts/ThemedContext';

type HeadersMap = {
  title: string;
  amount: string;
  date: string;
  transaction_type: string;
  note: string;
  account: string | number;
};

export default function ImportTransactions() {
  const { colors } = useThemeContext();
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const { mutateAsync: importExcelMutation, isPending: processing, data } = useImportExcel();
  const { mutateAsync: importBulkTransactions, isPending: saving } = useImportBulkTransaction();
  const { accounts } = useGetUserBankAccounts();

  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [headersMap, setHeadersMap] = useState<HeadersMap>({
    title: '',
    amount: '',
    date: '',
    transaction_type: '',
    note: '',
    account: '',
  });

  const validSheetRef = useRef<BottomSheet>(null);
  const invalidSheetRef = useRef<BottomSheet>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const validRows = useMemo(() => data?.validRows || [], [data?.validRows]);
  const invalidRows = useMemo(() => data?.invalidRows || [], [data?.invalidRows]);

  const onChangeMap = (field: keyof HeadersMap, value: string | number) => {
    setHeadersMap((prev) => ({ ...prev, [field]: value as any }));
  };

  const resetAll = () => {
    setStep(0);
    setExcelHeaders([]);
    setExcelData([]);
    setHeadersMap({
      title: '',
      amount: '',
      date: '',
      transaction_type: '',
      note: '',
      account: '',
    });
  };

  const pickExcelFile = async () => {
    try {
      // reset state
      setExcelHeaders([]);
      setExcelData([]);
      setHeadersMap({
        title: '',
        amount: '',
        date: '',
        transaction_type: '',
        note: '',
        account: '',
      });

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      if (result.canceled) return;

      const file = result.assets?.[0];
      if (!file) return;

      if (file.size && file.size > 1 * 1024 * 1024) {
        Alert.alert('File too large', 'Please upload a file smaller than 1MB.');
        return;
      }

      const fileContent = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const workbook = XLSX.read(fileContent, { type: 'base64' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
      const headersRow = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];

      if (!headersRow?.length || !jsonData?.length) {
        Alert.alert('Invalid File', 'This Excel file has no headers or data.');
        return;
      }

      setExcelData(jsonData);
      setExcelHeaders(headersRow);
      if (headersRow?.length === 0) {
        return;
      }
      setStep(1);
    } catch (e) {
      console.error('Error reading Excel:', e);
      Alert.alert('Error', 'Something went wrong while reading the file.');
    }
  };

  const canGoNextFromMap = useMemo(() => {
    return ['title', 'amount', 'date', 'transaction_type', 'account'].every(
      (key) => !!(headersMap as any)[key],
    );
  }, [headersMap]);

  const generatePreview = async () => {
    try {
      await importExcelMutation(
        { headers: headersMap, data: excelData },
        {
          onError: () => Alert.alert('Error', 'Failed to process file.'),
          onSuccess: () => setStep(2),
        },
      );
    } catch {
      Alert.alert('Error', 'Failed to process file.');
    }
  };

  const finalizeImport = async () => {
    try {
      await importBulkTransactions(
        { headers: headersMap, data: validRows },
        {
          onError: () => Alert.alert('Error', 'Failed to process file.'),
          onSuccess: () => {
            showToast({
              text1: 'Your transactions have been imported successfully',
              type: 'success',
              position: 'bottom',
            });
            resetAll();
          },
        },
      );
    } catch {
      Alert.alert('Error', 'Failed to process file.');
    }
  };

  // bottom sheet helpers
  const toggleValid = useCallback(() => {
    isSheetOpen ? validSheetRef.current?.close() : validSheetRef.current?.expand();
    setIsSheetOpen((s) => !s);
  }, [isSheetOpen]);

  const toggleInvalid = useCallback(() => {
    isSheetOpen ? invalidSheetRef.current?.close() : invalidSheetRef.current?.expand();
    setIsSheetOpen((s) => !s);
  }, [isSheetOpen]);

  const onSheetChange = useCallback((i: number) => setIsSheetOpen(i !== -1), []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
        style={{ backgroundColor: '#0000007f' }}
      />
    ),
    [],
  );

  const renderPreviewItem = useCallback(
    ({ item }: any) => (
      <View style={styles.itemContainer}>
        <View style={styles.left}>
          <View>
            <Text style={styles.name}>{item.title}</Text>
            <View style={styles.subTextContainer}>
              <Text
                style={[
                  styles.subText,
                  { marginRight: 6, fontFamily: 'Inter-600', maxWidth: 150 },
                ]}>
                {formatToCurrency(item.amount)} <Text>{'\u2022'}</Text>
              </Text>
              <Text style={[styles.subText, { marginRight: 6, fontFamily: 'Inter-500' }]}>
                {item.transaction_type}
                <Text> {'\u2022'} </Text>
              </Text>
              <Text style={[styles.subText, { marginRight: 6, fontFamily: 'Inter-400' }]}>
                {item.date}
              </Text>
            </View>
            {!!item.errors && (
              <Text style={[styles.subText, { color: '#F87171', maxWidth: 300 }]} numberOfLines={3}>
                {item.errors}
              </Text>
            )}
          </View>
        </View>
      </View>
    ),
    [],
  );

  return (
    <KeyboardAvoidingView
      {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
      style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <ThemedView style={{ flex: 1, paddingHorizontal: 15 }}>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <ProfileHeader title="Import Transactions" />
            <Spacer height={10} />

            <View style={styles.stepper}>
              {['File', 'Map', 'Submit'].map((label, idx) => {
                const active = step >= idx;
                return (
                  <View key={label} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepDot,
                        active
                          ? { ...styles.stepDotActive, backgroundColor: colors.primary }
                          : { ...styles.stepDotInactive, backgroundColor: colors.lighterTitle },
                      ]}>
                      <Text style={styles.stepDotText}>{idx + 1}</Text>
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        active ? {...styles.stepLabelActive, color: colors.primary} : {...styles.stepLabelInactive, color: colors.secondary},
                      ]}>
                      {label}
                    </Text>
                    {idx < 2 && (
                      <View
                        style={[
                          styles.stepLine,
                          active ? {...styles.stepLineActive, backgroundColor: colors.primary} : {...styles.stepLineInactive, backgroundColor: colors.secondary},
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>

            {step === 0 && (
              <View style={{ paddingHorizontal: 5 }}>
                <Text style={[styles.subText, { lineHeight: 20, marginBottom: 10, color: colors.description }]}>
                  Make sure your file includes the required columns like{' '}
                  <Text style={{ fontWeight: '600', color: colors.description }}>Title</Text>,{' '}
                  <Text style={{ fontWeight: '600', color: colors.description }}>Date</Text>,{' '}
                  <Text style={{ fontWeight: '600', color: colors.description }}>Amount</Text>, and{' '}
                  <Text style={{ fontWeight: '600', color: colors.description }}>Transaction Type</Text>.
                </Text>
                <Text style={[styles.subText, { color: colors.description }]}>
                  Supported format <Text style={{ fontWeight: '800', color: colors.description }}>.xlsx</Text>{' '}
                  only
                </Text>
                <Text style={[styles.subText, { color: colors.description }]}>
                  Please upload a file smaller than{' '}
                  <Text style={{ fontWeight: '800', color: colors.description  }}>1MB</Text>.
                </Text>
                <Spacer height={20} />
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.primary,
                    {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={pickExcelFile}>
                  <Text style={styles.title}>Choose a File</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 1 && excelHeaders?.length > 0 && (
              <View style={{ gap: 10, paddingHorizontal: 5 }}>
                <Text style={[styles.subText, { color: colors.description }]}>
                  Map your spreadsheet columns to the required fields.
                </Text>

                <CustomSelectInput
                  options={accounts.map((a) => ({ key: a.exp_ba_id, value: a.exp_ba_name }))}
                  isRequired
                  label="Choose account"
                  onChange={(v) => onChangeMap('account', v)}
                  isSmall
                  value={headersMap?.account as any}
                />
                <CustomSelectInput
                  options={excelHeaders.map((h) => ({ key: h, value: h }))}
                  isRequired
                  label="Title"
                  onChange={(v) => onChangeMap('title', v)}
                  isSmall
                  value={headersMap?.title}
                />
                <CustomSelectInput
                  options={excelHeaders.map((h) => ({ key: h, value: h }))}
                  isRequired
                  label="Amount"
                  onChange={(v) => onChangeMap('amount', v)}
                  isSmall
                  value={headersMap?.amount}
                />
                <CustomSelectInput
                  options={excelHeaders.map((h) => ({ key: h, value: h }))}
                  isRequired
                  label="Date"
                  onChange={(v) => onChangeMap('date', v)}
                  isSmall
                  value={headersMap?.date}
                />
                <CustomSelectInput
                  options={excelHeaders.map((h) => ({ key: h, value: h }))}
                  isRequired
                  label="Transaction Type"
                  onChange={(v) => onChangeMap('transaction_type', v)}
                  isSmall
                  value={headersMap?.transaction_type}
                />
                <CustomSelectInput
                  options={excelHeaders.map((h) => ({ key: h, value: h }))}
                  label="Note"
                  onChange={(v) => onChangeMap('note', v)}
                  isSmall
                  value={headersMap?.note}
                />

                <Spacer height={10} />
                <View>
                  <TouchableOpacity
                    disabled={!canGoNextFromMap || processing}
                    style={[
                      styles.button,
                      styles.accent,
                      {
                      backgroundColor: '#2E8B57',
                      },
                      (!canGoNextFromMap || processing) && styles.disable,
                    ]}
                    onPress={generatePreview}>
                    {processing && <ActivityIndicator color="#FFF" style={styles.loader} />}
                    <Text style={[styles.title, processing && styles.textDisable]}>
                      Generate Preview
                    </Text>
                  </TouchableOpacity>
                  <Spacer height={20} />
                  <TouchableOpacity
                    style={[styles.button, {
                      borderColor: colors.primary,
                      borderWidth: 1
                    },]}
                    onPress={() => setStep(0)}>
                    <Text style={[styles.title, {
                      color: colors.primary
                    }]}>Back</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 2 && (
              <View style={{ paddingHorizontal: 5 }}>
                <Text style={[styles.subText, { marginBottom: 8, color: colors.description }]}>
                  Preview the parsed rows below. You can open lists for valid/invalid rows.
                </Text>

                <View style={styles.previewCards}>
                  <View style={styles.previewCard}>
                    <Text style={styles.previewTitle}>Valid</Text>
                    <Text style={styles.previewCount}>{validRows.length}</Text>
                    {validRows.length > 0 && (
                      <TouchableOpacity
                        style={[styles.button, styles.accent]}
                        onPress={toggleValid}>
                        <Text style={styles.title}>View valid</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.previewCard}>
                    <Text style={[styles.previewTitle, { color: '#E63946' }]}>Invalid</Text>
                    <Text style={[styles.previewCount, { color: '#E63946' }]}>
                      {invalidRows.length}
                    </Text>
                    {invalidRows.length > 0 && (
                      <TouchableOpacity
                        style={[styles.button, styles.danger]}
                        onPress={toggleInvalid}>
                        <Text style={styles.title}>View invalid</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <Spacer height={10} />

                <View>
                  <View style={{ paddingHorizontal: 5 }}>
                    <Text style={[styles.subText, { marginBottom: 10, color: colors.description }]}>
                      Ready to import{' '}
                      <Text style={{ color: colors.description, fontWeight: '700' }}>{validRows.length}</Text>{' '}
                      valid records into{' '}
                      <Text style={{ color: colors.description, fontWeight: '700' }}>
                        {
                          accounts.find((a) => String(a.exp_ba_id) === String(headersMap.account))
                            ?.exp_ba_name
                        }
                      </Text>
                      .
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>                    
                      <TouchableOpacity
                        disabled={saving || validRows.length === 0}
                        style={[
                          styles.button,
                          styles.accent,
                          { flex: 1 },
                          {backgroundColor: colors.primary},
                          (saving || validRows.length === 0) && styles.disable,
                        ]}
                        onPress={finalizeImport}>
                        {saving && <ActivityIndicator color={colors.primary} style={styles.loader} />}
                        <Text style={[styles.title, saving && styles.textDisable]}>Import Now</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                      style={[styles.button, {
                        borderColor: colors.primary,
                        borderWidth: 1
                      },]}
                      onPress={() => setStep(2)}>
                      <Text style={[styles.title, {
                        color: colors.primary
                      }]}>Back</Text>
                    </TouchableOpacity>
                    </View>

                    <Spacer height={16} />
                    <TouchableOpacity style={[styles.button, {backgroundColor: colors.secondary}]} onPress={resetAll}>
                      <Text style={styles.title}>Start Over</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            <Spacer height={40} />
          </ScrollView>

          {validRows.length > 0 && (
            <BottomSheet
              ref={validSheetRef}
              index={-1}
              snapPoints={['35%', '70%']}
              enablePanDownToClose
              onChange={onSheetChange}
              backdropComponent={renderBackdrop}
              enableDynamicSizing={false}
              backgroundStyle={{ backgroundColor: '#20212C' }}
              handleIndicatorStyle={{ backgroundColor: '#ccc' }}>
              <Text style={styles.sheetTitle}>{validRows.length} valid records</Text>
              <BottomSheetFlatList
                data={validRows}
                keyExtractor={(_, i) => `v-${i}`}
                renderItem={renderPreviewItem}
                contentContainerStyle={styles.contentContainer}
                initialNumToRender={16}
                maxToRenderPerBatch={16}
                windowSize={7}
              />
            </BottomSheet>
          )}

          {invalidRows.length > 0 && (
            <BottomSheet
              ref={invalidSheetRef}
              index={-1}
              snapPoints={['35%', '70%']}
              enablePanDownToClose
              onChange={onSheetChange}
              backdropComponent={renderBackdrop}
              enableDynamicSizing={false}
              backgroundStyle={{ backgroundColor: '#20212C' }}
              handleIndicatorStyle={{ backgroundColor: '#ccc' }}>
              <Text style={[styles.sheetTitle, { color: '#E63946' }]}>
                {invalidRows.length} invalid records
              </Text>
              <BottomSheetFlatList
                data={invalidRows}
                keyExtractor={(_, i) => `i-${i}`}
                renderItem={renderPreviewItem}
                contentContainerStyle={styles.contentContainer}
                initialNumToRender={16}
                maxToRenderPerBatch={16}
                windowSize={7}
              />
            </BottomSheet>
          )}
        </ThemedView>
      </SafeAreaViewComponent>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // shared
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  title: { color: '#FFF', fontSize: 16, fontFamily: 'Inter-600' },
  primary: { backgroundColor: '#076ae3' },
  secondary: { backgroundColor: '#282343' },
  accent: { backgroundColor: '#2E8B57' },
  danger: { backgroundColor: '#7A1F1F' },
  disable: { opacity: 0.6 },
  textDisable: { opacity: 0 },
  loader: { position: 'absolute' },

  subText: { fontSize: 14, color: '#ccc', marginTop: 2 },

  // stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 5,
  },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  stepDotActive: { backgroundColor: '#076ae3' },
  stepDotInactive: { backgroundColor: '#282343' },
  stepDotText: { color: '#fff', fontSize: 12, fontFamily: 'Inter-700' },
  stepLabel: { fontSize: 12 },
  stepLabelActive: { color: '#EAEAEA', fontFamily: 'Inter-600' },
  stepLabelInactive: { color: '#8B8AA0', fontFamily: 'Inter-500' },
  stepLine: { width: 20, height: 2, marginHorizontal: 8, borderRadius: 2 },
  stepLineActive: { backgroundColor: '#076ae3' },
  stepLineInactive: { backgroundColor: '#282343' },

  // preview
  previewCards: { flexDirection: 'row', gap: 10 },
  previewCard: {
    flex: 1,
    backgroundColor: '#1A1B24',
    borderColor: '#2B2D3A',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  previewTitle: { color: '#EAEAEA', fontFamily: 'Inter-600', fontSize: 14 },
  previewCount: { color: '#9FEF9F', fontFamily: 'Inter-700', fontSize: 22, marginVertical: 6 },

  // list items
  contentContainer: { padding: 12 },
  itemContainer: {
    padding: 8,
    marginBottom: 12,
    backgroundColor: '#2A2B37',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  name: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter-600' },
  subTextContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },

  // sheet titles
  sheetTitle: {
    fontSize: 16,
    fontFamily: 'Inter-600',
    color: '#EAEAEA',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 6,
  },
});
