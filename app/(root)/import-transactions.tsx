import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as XLSX from 'xlsx';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Feather, MaterialIcons } from '@expo/vector-icons';

import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import Spacer from '@/components/Spacer';
import ProfileHeader from '@/components/ProfileHeader';
import { CustomSelectInput } from '@/components/CustomSelectInput';
import OverlayLoader from '@/components/Overlay';
import { FontSize } from '@/utils/Typography';
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

// Importing more than this in a single request times out on the backend, so
// large imports are split into sequential batches of this size instead.
const IMPORT_BATCH_SIZE = 100;

export default function ImportTransactions() {
  const { colors } = useThemeContext();
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const stepFade = useSharedValue(0);
  useEffect(() => {
    stepFade.value = 0;
    stepFade.value = withTiming(1, { duration: 300 });
  }, [step, stepFade]);
  const stepAnimatedStyle = useAnimatedStyle(() => ({
    opacity: stepFade.value,
    transform: [{ translateY: (1 - stepFade.value) * 8 }],
  }));

  const { mutateAsync: importExcelMutation, isPending: processing, data } = useImportExcel();
  const { mutateAsync: importBulkTransactions } = useImportBulkTransaction();
  const { accounts } = useGetUserBankAccounts();

  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [pickedFileName, setPickedFileName] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);
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

  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const isImporting = importProgress !== null;
  const importBatchCount = Math.ceil(validRows.length / IMPORT_BATCH_SIZE);
  const totalRows = validRows.length + invalidRows.length;
  const selectedAccountName = useMemo(
    () => accounts.find((a) => String(a.exp_ba_id) === String(headersMap.account))?.exp_ba_name,
    [accounts, headersMap.account],
  );

  const invalidReasonCounts = useMemo(() => {
    const counts = new Map<string, number>();
    invalidRows.forEach((row: any) => {
      String(row.errors || '')
        .split(',')
        .map((reason: string) => reason.trim())
        .filter(Boolean)
        .forEach((reason: string) => counts.set(reason, (counts.get(reason) || 0) + 1));
    });
    return Array.from(counts.entries()).sort(([, a], [, b]) => b - a);
  }, [invalidRows]);

  const getSample = useCallback(
    (field: keyof HeadersMap) => {
      const column = headersMap[field];
      if (!column || !excelData.length) return '';
      const value = excelData[0]?.[column as string];
      return value === undefined || value === null || value === '' ? '' : String(value);
    },
    [headersMap, excelData],
  );

  const onChangeMap = (field: keyof HeadersMap, value: string | number) => {
    setHeadersMap((prev) => ({ ...prev, [field]: value as any }));
  };

  const resetAll = () => {
    setStep(0);
    setExcelHeaders([]);
    setExcelData([]);
    setPickedFileName('');
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
      setPickedFileName('');
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

      setIsReadingFile(true);

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
      setPickedFileName(file.name);
      if (headersRow?.length === 0) {
        return;
      }
      setStep(1);
    } catch (e) {
      console.error('Error reading Excel:', e);
      Alert.alert('Error', 'Something went wrong while reading the file.');
    } finally {
      setIsReadingFile(false);
    }
  };

  const duplicateMappedColumns = useMemo(() => {
    const usedBy = new Map<string, (keyof HeadersMap)[]>();
    (['title', 'amount', 'date', 'transaction_type', 'note'] as (keyof HeadersMap)[]).forEach(
      (field) => {
        const column = headersMap[field];
        if (!column) return;
        const fields = usedBy.get(column as string) || [];
        fields.push(field);
        usedBy.set(column as string, fields);
      },
    );
    return Array.from(usedBy.entries()).filter(([, fields]) => fields.length > 1);
  }, [headersMap]);

  const fieldLabels: Record<keyof HeadersMap, string> = {
    title: 'Title',
    amount: 'Amount',
    date: 'Date',
    transaction_type: 'Transaction Type',
    note: 'Note',
    account: 'Account',
  };

  const requiredFieldsMapped = useMemo(() => {
    return ['title', 'amount', 'date', 'transaction_type', 'account'].every(
      (key) => !!(headersMap as any)[key],
    );
  }, [headersMap]);

  const canGoNextFromMap = requiredFieldsMapped && duplicateMappedColumns.length === 0;

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
    const total = validRows.length;
    const batches: typeof validRows[] = [];
    for (let i = 0; i < total; i += IMPORT_BATCH_SIZE) {
      batches.push(validRows.slice(i, i + IMPORT_BATCH_SIZE));
    }

    let completed = 0;
    setImportProgress({ done: 0, total });

    try {
      for (const batch of batches) {
        await importBulkTransactions({ headers: headersMap, data: batch });
        completed += batch.length;
        setImportProgress({ done: completed, total });
      }
      showToast({
        text1: 'Your transactions have been imported successfully',
        type: 'success',
        position: 'bottom',
      });
      resetAll();
    } catch {
      Alert.alert(
        'Import incomplete',
        completed > 0
          ? `${completed} of ${total} records were imported before an error occurred. Run the import again to add the rest.`
          : 'Failed to process file.',
      );
    } finally {
      setImportProgress(null);
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
        pressBehavior="none"
        disappearsOnIndex={-1}
        appearsOnIndex={1}
        style={{ backgroundColor: colors.scrim }}
      />
    ),
    [colors],
  );

  const renderPreviewItem = useCallback(
    ({ item }: any) => (
      <View style={[styles.itemContainer, { backgroundColor: colors.bottomBarBackground }]}>
        <View style={styles.left}>
          <View>
            <Text style={[styles.name, { color: colors.description }]}>{item.title}</Text>
            <View style={styles.subTextContainer}>
              <Text
                style={[
                  styles.subText,
                  {
                    marginRight: 6,
                    fontFamily: 'Inter-600',
                    maxWidth: 150,
                    color: colors.description,
                  },
                ]}>
                {formatToCurrency(item.amount)} <Text>{'\u2022'}</Text>
              </Text>
              <Text
                style={[
                  styles.subText,
                  { marginRight: 6, fontFamily: 'Inter-500', color: colors.description },
                ]}>
                {item.transaction_type}
                <Text> {'\u2022'} </Text>
              </Text>
              <Text
                style={[
                  styles.subText,
                  { marginRight: 6, fontFamily: 'Inter-400', color: colors.description },
                ]}>
                {item.date}
              </Text>
            </View>
            {!!item.errors && (
              <Text style={[styles.subText, { color: colors.expense, maxWidth: 300 }]} numberOfLines={3}>
                {item.errors}
              </Text>
            )}
          </View>
        </View>
      </View>
    ),
    [colors],
  );

  return (
    <KeyboardAvoidingView
      {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
      style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <ThemedView style={{ flex: 1, paddingHorizontal: 15 }}>
          {processing && <OverlayLoader />}
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
                          : { ...styles.stepDotInactive, backgroundColor: colors.secondary },
                      ]}>
                      <Text style={[styles.stepDotText, { color: colors.onPrimary }]}>
                        {idx + 1}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        active
                          ? { ...styles.stepLabelActive, color: colors.primary }
                          : { ...styles.stepLabelInactive, color: colors.secondary },
                      ]}>
                      {label}
                    </Text>
                    {idx < 2 && (
                      <View
                        style={[
                          styles.stepLine,
                          active
                            ? { ...styles.stepLineActive, backgroundColor: colors.primary }
                            : { ...styles.stepLineInactive, backgroundColor: colors.secondary },
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>

            <Animated.View style={stepAnimatedStyle}>
            {step === 0 && (
              <View style={{ paddingHorizontal: 5 }}>
                <Text
                  style={[
                    styles.subText,
                    { lineHeight: 20, marginBottom: 10, color: colors.description },
                  ]}>
                  Make sure your file includes the required columns like{' '}
                  <Text style={{ fontFamily: 'Inter-600', color: colors.primary }}>Title</Text>,{' '}
                  <Text style={{ fontFamily: 'Inter-600', color: colors.primary }}>Date</Text>,{' '}
                  <Text style={{ fontFamily: 'Inter-600', color: colors.primary }}>Amount</Text>,
                  and{' '}
                  <Text style={{ fontFamily: 'Inter-600', color: colors.primary }}>
                    Transaction Type
                  </Text>
                  .
                </Text>
                <Text style={[styles.subText, { color: colors.description }]}>
                  Supported format{' '}
                  <Text style={{ fontFamily: 'Inter-600', color: colors.primary }}>.xlsx</Text> only
                </Text>
                <Text style={[styles.subText, { color: colors.description }]}>
                  Please upload a file smaller than{' '}
                  <Text style={{ fontFamily: 'Inter-600', color: colors.primary }}>1MB</Text>.
                </Text>
                <Spacer height={20} />
                <TouchableOpacity
                  disabled={isReadingFile}
                  style={[
                    styles.dropzone,
                    { borderColor: colors.primary, backgroundColor: colors.inputColor },
                    isReadingFile && styles.disable,
                  ]}
                  onPress={pickExcelFile}>
                  {isReadingFile ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <MaterialIcons name="upload-file" size={30} color={colors.primary} />
                  )}
                  <Spacer height={8} />
                  <Text style={[styles.title, { color: colors.primary }]}>
                    {isReadingFile ? 'Reading file…' : 'Choose a File'}
                  </Text>
                  <Text style={[styles.subText, { color: colors.description, marginTop: 2 }]}>
                    Tap to browse your device
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 1 && excelHeaders?.length > 0 && (
              <View style={{ gap: 10, paddingHorizontal: 5 }}>
                {!!pickedFileName && (
                  <View
                    style={[
                      styles.fileChip,
                      { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
                    ]}>
                    <Feather name="file-text" size={14} color={colors.primary} />
                    <Text
                      style={[styles.fileChipText, { color: colors.title }]}
                      numberOfLines={1}>
                      {pickedFileName}
                    </Text>
                    <Text style={[styles.fileChipMeta, { color: colors.description }]}>
                      {excelData.length} row{excelData.length === 1 ? '' : 's'}
                    </Text>
                  </View>
                )}

                <Text style={[styles.subText, { color: colors.description }]}>
                  Map your spreadsheet columns to the required fields.
                </Text>

                {duplicateMappedColumns.length > 0 && (
                  <View
                    style={[
                      styles.warningBanner,
                      { backgroundColor: `${colors.expense}1A`, borderColor: colors.expense },
                    ]}>
                    <Feather name="alert-triangle" size={14} color={colors.expense} />
                    <Text style={[styles.warningText, { color: colors.expense }]}>
                      &quot;{duplicateMappedColumns[0][0]}&quot; is mapped to both{' '}
                      {duplicateMappedColumns[0][1].map((f) => fieldLabels[f]).join(' and ')}.
                      Each column should be used once.
                    </Text>
                  </View>
                )}

                <CustomSelectInput
                  options={accounts.map((a) => ({ key: a.exp_ba_id, value: a.exp_ba_name }))}
                  isRequired
                  label="Choose account"
                  onChange={(v) => onChangeMap('account', v)}
                  isSmall
                  value={headersMap?.account as any}
                />
                <View>
                  <CustomSelectInput
                    options={excelHeaders.map((h) => ({ key: h, value: h }))}
                    isRequired
                    label="Title"
                    onChange={(v) => onChangeMap('title', v)}
                    isSmall
                    clearable
                    value={headersMap?.title}
                  />
                  {!!getSample('title') && (
                    <Text style={[styles.sampleHint, { color: colors.description }]} numberOfLines={1}>
                      Sample: {getSample('title')}
                    </Text>
                  )}
                </View>
                <View>
                  <CustomSelectInput
                    options={excelHeaders.map((h) => ({ key: h, value: h }))}
                    isRequired
                    label="Amount"
                    onChange={(v) => onChangeMap('amount', v)}
                    isSmall
                    clearable
                    value={headersMap?.amount}
                  />
                  {!!getSample('amount') && (
                    <Text style={[styles.sampleHint, { color: colors.description }]} numberOfLines={1}>
                      Sample: {getSample('amount')}
                    </Text>
                  )}
                </View>
                <View>
                  <CustomSelectInput
                    options={excelHeaders.map((h) => ({ key: h, value: h }))}
                    isRequired
                    label="Date"
                    onChange={(v) => onChangeMap('date', v)}
                    isSmall
                    clearable
                    value={headersMap?.date}
                  />
                  {!!getSample('date') && (
                    <Text style={[styles.sampleHint, { color: colors.description }]} numberOfLines={1}>
                      Sample: {getSample('date')}
                    </Text>
                  )}
                </View>
                <View>
                  <CustomSelectInput
                    options={excelHeaders.map((h) => ({ key: h, value: h }))}
                    isRequired
                    label="Transaction Type"
                    onChange={(v) => onChangeMap('transaction_type', v)}
                    isSmall
                    clearable
                    value={headersMap?.transaction_type}
                  />
                  {!!getSample('transaction_type') && (
                    <Text style={[styles.sampleHint, { color: colors.description }]} numberOfLines={1}>
                      Sample: {getSample('transaction_type')}
                    </Text>
                  )}
                </View>
                <View>
                  <CustomSelectInput
                    options={excelHeaders.map((h) => ({ key: h, value: h }))}
                    label="Note"
                    onChange={(v) => onChangeMap('note', v)}
                    isSmall
                    clearable
                    value={headersMap?.note}
                  />
                  {!!getSample('note') && (
                    <Text style={[styles.sampleHint, { color: colors.description }]} numberOfLines={1}>
                      Sample: {getSample('note')}
                    </Text>
                  )}
                </View>

                <Spacer height={10} />
                <View>
                  <TouchableOpacity
                    disabled={!canGoNextFromMap || processing}
                    style={[
                      styles.button,
                      styles.accent,
                      {
                        backgroundColor: colors.income,
                      },
                      (!canGoNextFromMap || processing) && styles.disable,
                    ]}
                    onPress={generatePreview}>
                    {processing && (
                      <ActivityIndicator color={colors.onPrimary} style={styles.loader} />
                    )}
                    <Text
                      style={[
                        styles.title,
                        { color: colors.onPrimary },
                        processing && styles.textDisable,
                      ]}>
                      Generate Preview
                    </Text>
                  </TouchableOpacity>
                  {!requiredFieldsMapped && duplicateMappedColumns.length === 0 && (
                    <Text
                      style={[
                        styles.subText,
                        { color: colors.description, textAlign: 'center', marginTop: 8 },
                      ]}>
                      Map all required fields (Title, Amount, Date, Transaction Type, Account) to
                      continue.
                    </Text>
                  )}
                  <Spacer height={20} />
                  <TouchableOpacity
                    style={[
                      styles.button,
                      {
                        borderColor: colors.secondary,
                        borderWidth: 1,
                      },
                    ]}
                    onPress={() => setStep(0)}>
                    <Text
                      style={[
                        styles.title,
                        {
                          color: colors.secondary,
                        },
                      ]}>
                      Back
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 2 && (
              <View style={{ paddingHorizontal: 5 }}>
                <View
                  style={[
                    styles.targetCard,
                    { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
                  ]}>
                  <View style={[styles.targetIcon, { backgroundColor: colors.primary }]}>
                    <MaterialIcons name="account-balance" size={18} color={colors.onPrimary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.targetLabel, { color: colors.description }]}>
                      Importing into
                    </Text>
                    <Text style={[styles.targetName, { color: colors.title }]} numberOfLines={1}>
                      {selectedAccountName}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.targetTotal, { color: colors.title }]}>{totalRows}</Text>
                    <Text style={[styles.targetTotalLabel, { color: colors.description }]}>
                      rows found
                    </Text>
                  </View>
                </View>

                <Spacer height={14} />

                <View style={styles.previewCards}>
                  <View
                    style={[
                      styles.previewCard,
                      invalidRows.length === 0 && { flex: 1 },
                      { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
                    ]}>
                    <View style={styles.previewCardHeader}>
                      <Feather name="check-circle" size={14} color={colors.income} />
                      <Text style={[styles.previewTitle, { color: colors.income }]}>Valid</Text>
                    </View>
                    <Text style={[styles.previewCount, { color: colors.income }]}>{validRows.length}</Text>
                    {validRows.length > 0 && (
                      <TouchableOpacity
                        style={[styles.button, styles.accent, { backgroundColor: colors.income }]}
                        onPress={toggleValid}>
                        <Text style={[styles.title, { color: colors.onPrimary }]}>View all</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {invalidRows.length > 0 && (
                    <View
                      style={[
                        styles.previewCard,
                        { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
                      ]}>
                      <View style={styles.previewCardHeader}>
                        <Feather name="alert-circle" size={14} color={colors.expense} />
                        <Text style={[styles.previewTitle, { color: colors.expense }]}>Invalid</Text>
                      </View>
                      <Text style={[styles.previewCount, { color: colors.expense }]}>
                        {invalidRows.length}
                      </Text>
                      <View style={styles.reasonList}>
                        {invalidReasonCounts.map(([reason, count]) => (
                          <View
                            key={reason}
                            style={[styles.reasonChip, { borderColor: colors.expense }]}>
                            <Text
                              style={[styles.reasonText, { color: colors.expense }]}
                              numberOfLines={1}>
                              {reason} · {count}
                            </Text>
                          </View>
                        ))}
                      </View>
                      <Spacer height={8} />
                      <TouchableOpacity
                        style={[styles.button, styles.danger, { backgroundColor: colors.expense }]}
                        onPress={toggleInvalid}>
                        <Text style={[styles.title, { color: colors.onPrimary }]}>View all</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {validRows.length > 0 && (
                  <>
                    <Spacer height={16} />
                    <Text style={[styles.sectionLabel, { color: colors.description }]}>
                      Preview
                    </Text>
                    <Spacer height={6} />
                    {validRows.slice(0, 3).map((item: any, idx: number) => (
                      <View key={idx} style={{ marginBottom: 8 }}>
                        {renderPreviewItem({ item })}
                      </View>
                    ))}
                    {validRows.length > 3 && (
                      <TouchableOpacity onPress={toggleValid}>
                        <Text style={[styles.moreLink, { color: colors.primary }]}>
                          +{validRows.length - 3} more valid row
                          {validRows.length - 3 === 1 ? '' : 's'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}

                <Spacer height={10} />

                <View>
                  <View style={{ paddingHorizontal: 5 }}>
                    {isImporting ? (
                      <View style={{ marginBottom: 14 }}>
                        <Text style={[styles.subText, { color: colors.description, marginBottom: 8 }]}>
                          Importing{' '}
                          <Text style={{ color: colors.primary, fontFamily: 'Inter-600' }}>
                            {importProgress?.done}
                          </Text>{' '}
                          of{' '}
                          <Text style={{ color: colors.primary, fontFamily: 'Inter-600' }}>
                            {importProgress?.total}
                          </Text>{' '}
                          records…
                        </Text>
                        <View
                          style={[styles.importProgressTrack, { backgroundColor: colors.inputBorder }]}>
                          <View
                            style={[
                              styles.importProgressFill,
                              {
                                backgroundColor: colors.primary,
                                width: `${Math.min(
                                  100,
                                  ((importProgress?.done ?? 0) / (importProgress?.total || 1)) * 100,
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    ) : (
                      validRows.length > 0 &&
                      importBatchCount > 1 && (
                        <Text style={[styles.subText, { marginBottom: 10, color: colors.description }]}>
                          Sent in{' '}
                          <Text style={{ color: colors.primary, fontFamily: 'Inter-600' }}>
                            {importBatchCount}
                          </Text>{' '}
                          batches of up to {IMPORT_BATCH_SIZE} records each to avoid timeouts.
                        </Text>
                      )
                    )}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        disabled={isImporting || validRows.length === 0}
                        style={[
                          styles.button,
                          styles.accent,
                          { flex: 1 },
                          { backgroundColor: colors.primary },
                          (isImporting || validRows.length === 0) && styles.disable,
                        ]}
                        onPress={finalizeImport}>
                        {isImporting && (
                          <ActivityIndicator color={colors.primary} style={styles.loader} />
                        )}
                        <Text
                          style={[
                            styles.title,
                            { color: colors.onPrimary },
                            isImporting && styles.textDisable,
                          ]}>
                          Import Now
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        disabled={isImporting}
                        style={[
                          styles.button,
                          {
                            borderColor: colors.primary,
                            borderWidth: 1,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                          },
                          isImporting && styles.disable,
                        ]}
                        onPress={() => setStep(1)}>
                        <Text
                          style={[
                            styles.title,
                            {
                              color: colors.primary,
                            },
                          ]}>
                          Back
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Spacer height={14} />
                    <TouchableOpacity
                      disabled={isImporting}
                      style={[styles.startOverButton, isImporting && styles.disable]}
                      onPress={resetAll}>
                      <Feather name="refresh-ccw" size={13} color={colors.description} />
                      <Text style={[styles.startOverText, { color: colors.description }]}>
                        Start Over
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            </Animated.View>

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
              backgroundStyle={{ backgroundColor: colors.cardBg }}
              handleIndicatorStyle={{ backgroundColor: colors.borderColor }}>
              <Text style={[styles.sheetTitle, { color: colors.title }]}>
                {validRows.length} valid records
              </Text>
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
              backgroundStyle={{ backgroundColor: colors.cardBg }}
              handleIndicatorStyle={{ backgroundColor: colors.borderColor }}>
              <Text style={[styles.sheetTitle, { color: colors.expense }]}>
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
  title: { fontSize: FontSize.md, fontFamily: 'Inter-600' },
  primary: {},
  accent: {},
  danger: {},
  disable: { opacity: 0.4 },
  textDisable: { opacity: 0 },
  loader: { position: 'absolute' },

  subText: { fontSize: FontSize.base, marginTop: 2, fontFamily: 'Inter-500' },

  // file picker
  dropzone: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  fileChipText: { flex: 1, fontSize: FontSize.base, fontFamily: 'Inter-600' },
  fileChipMeta: { fontSize: FontSize.sm, fontFamily: 'Inter-500' },

  // mapping warnings
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  warningText: { flex: 1, fontSize: FontSize.sm, fontFamily: 'Inter-500', lineHeight: 18 },

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
  stepDotActive: {},
  stepDotInactive: {},
  stepDotText: { fontSize: FontSize.sm, fontFamily: 'Inter-700' },
  stepLabel: { fontSize: FontSize.sm, fontFamily: 'Inter-500' },
  stepLabelActive: { fontFamily: 'Inter-600' },
  stepLabelInactive: { fontFamily: 'Inter-500' },
  stepLine: { width: 20, height: 2, marginHorizontal: 8, borderRadius: 2 },
  stepLineActive: {},
  stepLineInactive: {},

  // import target summary
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  targetIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetLabel: { fontSize: FontSize.sm, fontFamily: 'Inter-500' },
  targetName: { fontSize: FontSize.base, fontFamily: 'Inter-700', marginTop: 1 },
  targetTotal: { fontSize: FontSize.md, fontFamily: 'Inter-700' },
  targetTotalLabel: { fontSize: FontSize.sm, fontFamily: 'Inter-500' },

  // preview
  previewCards: { flexDirection: 'row', gap: 10 },
  previewCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  previewCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  previewTitle: { fontFamily: 'Inter-600', fontSize: FontSize.base },
  previewCount: { fontFamily: 'Inter-700', fontSize: 22, marginVertical: 6 },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  moreLink: { fontSize: FontSize.base, fontFamily: 'Inter-600', marginTop: 2 },

  // start over
  startOverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  startOverText: { fontSize: FontSize.base, fontFamily: 'Inter-500' },

  // import progress
  importProgressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  importProgressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // mapping sample hints
  sampleHint: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-400',
    marginTop: 4,
  },

  // invalid reason breakdown
  reasonList: { alignItems: 'center', gap: 4 },
  reasonChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  reasonText: { fontSize: FontSize.sm, fontFamily: 'Inter-500' },

  // list items
  contentContainer: { padding: 12 },
  itemContainer: {
    padding: 8,
    marginBottom: 12,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  name: { fontSize: FontSize.base, fontFamily: 'Inter-600' },
  subTextContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },

  // sheet titles
  sheetTitle: {
    fontSize: FontSize.md,
    fontFamily: 'Inter-600',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 6,
  },
});
