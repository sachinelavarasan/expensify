import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
} from 'react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import Spacer from '@/components/Spacer';
import { CustomSelectInput } from '@/components/CustomSelectInput';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';
import { useImportExcel } from '@/hooks/useExportTransactions';
import { formatToCurrency } from '@/utils/formatter';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import ProfileHeader from '@/components/ProfileHeader';
import AuthLink from '@/components/AuthLink';

export default function ImportTransaction() {
  const { mutateAsync: importExcelMutation, isPending: processing, data } = useImportExcel();
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [excelHeadersMap, setExcelHeadersMap] = useState<any>({
    title: '',
    amount: '',
    date: '',
    transaction_type: '',
    note: '',
  });
  const [excelData, setExcelData] = useState([]);

  const bottomSheetValidRef = useRef<BottomSheet>(null);
  const bottomSheetInvalidRef = useRef<BottomSheet>(null);

  const [isOpen, setIsOpen] = useState(false);

  const toggleSheetValid = useCallback(() => {
    if (isOpen) {
      bottomSheetValidRef.current?.close();
    } else {
      bottomSheetValidRef.current?.expand();
    }
    setIsOpen(!isOpen);
  }, [isOpen]);
  const toggleSheetInvalid = useCallback(() => {
    if (isOpen) {
      bottomSheetInvalidRef.current?.close();
    } else {
      bottomSheetInvalidRef.current?.expand();
    }
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleSheetChanges = useCallback((index: number) => {
    setIsOpen(index !== -1);
  }, []);

  const validRows = useMemo(() => data?.validRows || [], [data?.validRows]);
  const invalidRows = useMemo(() => data?.invalidRows || [], [data?.invalidRows]);

  const renderItem = useCallback(
    ({ item }: any) => (
      <View style={styles.itemContainer}>
        <View style={styles.left}>
          <View>
            <View>
              <Text style={styles.name}>{item.title}</Text>
            </View>
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

  const pickExcelFile = async () => {
    try {
      setExcelHeadersMap({
        title: '',
        amount: '',
        date: '',
        transaction_type: '',
        note: '',
      });
      setExcelData([]);
      setExcelHeaders([])
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      if (result.canceled === false && result.assets?.length > 0) {
        const fileUri = result.assets[0].uri;
        const file = result.assets[0];
        if (file.size && file.size > 1 * 1024 * 1024) {
          Alert.alert('File too large', 'Please upload a file smaller than 2MB.');
          return;
        }
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const workbook = XLSX.read(fileContent, { type: 'base64' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any = XLSX.utils.sheet_to_json(worksheet);
        const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
        if (!headers?.length || !jsonData?.length) {
          Alert.alert('Invalid File', 'This excel file has no headers or data.');
          return;
        }
        setExcelData(jsonData);
        setExcelHeaders(headers);
      }
    } catch (error) {
      console.error('Error picking or reading Excel file:', error);
      Alert.alert('Error', 'Something went wrong while reading the file.');
    }
  };

  const onChangeText = (field: string, value: string | number) => {
    setExcelHeadersMap((prev: any) => ({ ...prev, [field]: value }));
  };

  const disableButton = useMemo(() => {
    return ['title', 'amount', 'date', 'transaction_type'].every((item: any) =>
      Boolean(excelHeadersMap[item]),
    );
  }, [excelHeadersMap]);

  async function processExcelData() {
    try {
      importExcelMutation(
        { headers: excelHeadersMap, data: excelData },
        {
          onError: (res) => {
            console.log(res);
            Alert.alert('Error', 'Something went wront');
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  }

  const renderBackdrop = useCallback(
    (props: React.JSX.IntrinsicAttributes & BottomSheetDefaultBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
        style={{ backgroundColor: '#0000007f' }}
      />
    ),
    [],
  );

  return (
    <KeyboardAvoidingView
      {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
      style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <View style={{ flex: 1 }}>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <ThemedView
              style={{
                flex: 1,
                paddingHorizontal: 15,
              }}>
              <ProfileHeader title="Import Transactions" />
              <Spacer height={10} />

              <View style={[{ paddingHorizontal: 5 }]}>
                <Text style={[styles.subText, { lineHeight: 20, marginBottom: 10 }]}>
                  Make sure your file includes the required columns like{' '}
                  <Text style={{ fontWeight: '600', color: '#EAEAEA' }}>Title</Text>,{' '}
                  <Text style={{ fontWeight: '600', color: '#EAEAEA' }}>Date</Text>,{' '}
                  <Text style={{ fontWeight: '600', color: '#EAEAEA' }}>Amount</Text>, and{' '}
                  <Text style={{ fontWeight: '600', color: '#EAEAEA' }}>Transaction Type</Text>.
                  This helps in quickly importing bulk expenses without adding them one by one.
                </Text>
                <Text style={styles.subText}>
                  Supported format <Text style={{ fontWeight: '800', color: '#FFF' }}>.xlsx</Text>{' '}
                  only
                </Text>
                <Text style={styles.subText}>
                  Please upload a file smaller than{' '}
                  <Text style={{ fontWeight: '800', color: '#FFF' }}>1MB</Text>.
                </Text>
                <Spacer height={10} />
                <TouchableOpacity style={[styles.button, styles.opacityBg]} onPress={pickExcelFile}>
                  <Text style={[styles.title]}>Choose a File</Text>
                </TouchableOpacity>
                <Spacer height={20} />

                {excelHeaders.length > 0 && (
                  <View style={{ gap: 10 }}>
                    <Text style={styles.subText}>
                      Please confirm the columns in your file that will be used to create
                      transactions{' '}
                    </Text>
                    <View style={{ paddingVertical: 2 }}>
                      <CustomSelectInput
                        options={excelHeaders.map((account) => ({
                          key: account,
                          value: account,
                        }))}
                        isRequired
                        label={'Title'}
                        onChange={(value) => {
                          onChangeText('title', value);
                        }}
                        isSmall
                        value={excelHeadersMap.title}
                      />
                    </View>
                    <View style={{ paddingVertical: 2 }}>
                      <CustomSelectInput
                        options={excelHeaders.map((account) => ({
                          key: account,
                          value: account,
                        }))}
                        isRequired
                        label={'Amount'}
                        onChange={(value) => {
                          onChangeText('amount', value);
                        }}
                        isSmall
                        value={excelHeadersMap.amount}
                      />
                    </View>
                    <View style={{ paddingVertical: 2 }}>
                      <CustomSelectInput
                        options={excelHeaders.map((account) => ({
                          key: account,
                          value: account,
                        }))}
                        isRequired
                        label={'Date'}
                        onChange={(value) => {
                          onChangeText('date', value);
                        }}
                        isSmall
                        value={excelHeadersMap.date}
                      />
                    </View>
                    <View style={{ paddingVertical: 2 }}>
                      <CustomSelectInput
                        options={excelHeaders.map((account) => ({
                          key: account,
                          value: account,
                        }))}
                        isRequired
                        label={'Transaction Type'}
                        onChange={(value) => {
                          onChangeText('transaction_type', value);
                        }}
                        isSmall
                        value={excelHeadersMap.transaction_type}
                      />
                    </View>
                    <View style={{ paddingVertical: 2 }}>
                      <CustomSelectInput
                        options={excelHeaders.map((account) => ({
                          key: account,
                          value: account,
                        }))}
                        label={'Note'}
                        onChange={(value) => {
                          onChangeText('note', value);
                        }}
                        isSmall
                        value={excelHeadersMap.note}
                      />
                    </View>
                    <Spacer height={10} />
                    <TouchableOpacity
                      disabled={!disableButton || processing}
                      style={[
                        styles.button,
                        styles.logoutBg,
                        !disableButton || processing ? styles.disable : '',
                      ]}
                      onPress={processExcelData}>
                      {processing ? (
                        <ActivityIndicator animating color={'#FFF'} style={styles.loader} />
                      ) : null}
                      <Text style={[styles.title, processing ? styles.textDisable : {}]}>
                        Submit File
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <Spacer height={20} />
              {validRows.length > 0 && (
                <AuthLink onPress={toggleSheetValid} linkText="View valid records" />
              )}
              <Spacer height={20} />
              {invalidRows.length > 0 && (
                <AuthLink onPress={toggleSheetInvalid} linkText="View invalid records" />
              )}
              <Spacer height={50} />
            </ThemedView>
          </ScrollView>

          {validRows.length > 0 && (
            <>
              <BottomSheet
                ref={bottomSheetValidRef}
                index={-1}
                snapPoints={['35%', '70%']}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                enableDynamicSizing={false}
                backgroundStyle={{ backgroundColor: '#20212C' }}
                handleIndicatorStyle={{ backgroundColor: '#ccc' }}
                onChange={handleSheetChanges}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'Inter-600',
                    color: '#EAEAEA',
                    paddingHorizontal: 16,
                  }}>
                  {validRows.length} valid records
                </Text>
                <BottomSheetFlatList
                  data={validRows}
                  keyExtractor={(i: any, index: number) => index.toString()}
                  renderItem={renderItem}
                  contentContainerStyle={styles.contentContainer}
                  initialNumToRender={20}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                />
              </BottomSheet>
            </>
          )}
          {invalidRows.length > 0 && (
            <>
              <BottomSheet
                ref={bottomSheetInvalidRef}
                index={-1}
                snapPoints={['35%', '70%']}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                enableDynamicSizing={false}
                backgroundStyle={{ backgroundColor: '#20212C' }}
                handleIndicatorStyle={{ backgroundColor: '#ccc' }}
                onChange={handleSheetChanges}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'Inter-600',
                    color: '#E63946',
                    paddingHorizontal: 16,
                  }}>
                  {invalidRows.length} invalid records
                </Text>
                <BottomSheetFlatList
                  data={invalidRows}
                  keyExtractor={(i: any, index: number) => index.toString()}
                  renderItem={renderItem}
                  contentContainerStyle={styles.contentContainer}
                  initialNumToRender={20}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                />
              </BottomSheet>
            </>
          )}
        </View>
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
    borderRadius: 8,
    paddingVertical: 10,
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
  opacityBg: {
    backgroundColor: '#076ae3',
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
  subText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 2,
  },
  contentContainer: {
    padding: 12,
  },

  itemContainer: {
    padding: 8,
    marginBottom: 12,
    backgroundColor: '#2A2B37',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-600',
  },
  subTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
});
