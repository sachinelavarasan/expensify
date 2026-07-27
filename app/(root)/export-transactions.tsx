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
import React, { useEffect, useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

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
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';

export default function ExportData() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const { mutateAsync: exportExcelMutation, isPending } = useExportExcelTransactions();
  const { mutateAsync: exportPdfMutation, isPending: isPdfLoading } = useExportPdfTransactions();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [docType, setDoctype] = useState<number | string>('pdf');
  const [tranType, setTranType] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState('');

  const cardFade = useSharedValue(0);
  useEffect(() => {
    cardFade.value = withTiming(1, { duration: 350 });
  }, [cardFade]);
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardFade.value,
    transform: [{ translateY: (1 - cardFade.value) * 10 }],
  }));

  async function download() {
    if (!start || !end) {
      return;
    }
    setErrorMessage('');
    try {
      switch (docType) {
        case 'xlsx':
          await exportExcelMutation({
            startDate: start,
            endDate: end,
            fileType: 'xlsx',
            tranType,
          });
          setEnd('');
          setStart('');
          break;
        case 'csv':
          await exportExcelMutation({
            startDate: start,
            endDate: end,
            fileType: 'csv',
            tranType,
          });
          setEnd('');
          setStart('');
          break;
        default:
          await exportPdfMutation({
            startDate: start,
            endDate: end,
            tranType,
          });
          setEnd('');
          setStart('');
          break;
      }
    } catch {
      setErrorMessage('Something went wrong while exporting your transactions. Please try again.');
    }
  }

  return (
    <KeyboardAvoidingView
      {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
      style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          <ThemedView
            style={{
              flex: 1,
              paddingHorizontal: 20,
            }}>
            <ProfileHeader title="Export Transactions" paddingHorizontal={false} />
            <Spacer height={20} />
            <Animated.View style={cardAnimatedStyle}>
            <View style={{ alignItems: 'flex-start' }}>
              <View style={[styles.card, { width: '100%', backgroundColor: colors.inputColor, borderColor: colors.inputBorder }]}>
                <DatePickerWithOutValue
                  label="From:"
                  onChange={(data: string) => setStart(data)}
                  value={start}
                  placeholder="Start date"
                />
                <Spacer height={5} />
                <AntDesign name="arrow-down" size={24} color={colors.primary} />
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
            <View style={[styles.card,{ backgroundColor: colors.inputColor, borderColor: colors.inputBorder }]}>
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
            <View style={[styles.card,{ backgroundColor: colors.inputColor, borderColor: colors.inputBorder }]}>
              <CustomRadioButton
                label="Transaction Type"
                value={tranType}
                options={transactionExportType}
                onChange={(data) => {
                  setTranType(String(data));
                }}
              />
            </View>
            </Animated.View>
            <View style={[styles.btnContainer, { paddingHorizontal: 5 }]}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.logoutBg,
                  {
                   backgroundColor: colors.primary
                  },
                  isPdfLoading || isPending || !start || !end ? styles.disable : '',
                ]}
                disabled={!start || !end}
                onPress={download}>
                {isPdfLoading || isPending ? (
                  <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
                ) : null}
                <Text style={[styles.title, { color: colors.onPrimary }, isPdfLoading || isPending  ? styles.textDisable : {}]}>
                  Export Now
                </Text>
              </TouchableOpacity>
              {!!errorMessage && (
                <Text style={[styles.subText, { color: colors.expense, textAlign: 'center', marginTop: 8 }]}>
                  {errorMessage}
                </Text>
              )}
            </View>
            <Spacer height={20} />
            <Spacer
              height={1}
              otherStyle={{
                backgroundColor: colors.borderColor,
              }}
            />
            <Spacer height={20} />
            <View style={[{ paddingHorizontal: 5 }]}>
              <Text style={[styles.subText, { lineHeight: 20, color: colors.description }]}>
                If you want to add multiple transactions at once, simply click the{' '}
                <Text style={{ fontFamily: 'Inter-600', color: colors.primary }}>Import Transations</Text> button and upload
                your <Text style={{ fontFamily: 'Inter-600', color: colors.primary }}>.xlsx</Text> file.
              </Text>
              <Spacer height={10} />
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.opacityBg,
                  {
                    backgroundColor: colors.income
                  }
                ]}
                onPress={() => router.push('/(root)/import-transactions')}>
                <Text style={[styles.title, { color: colors.onPrimary }]}>
                  Import Transactions
                </Text>
              </TouchableOpacity>
              <Spacer height={20} />

            </View>

            <Spacer height={100} />
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
    borderRadius: 8,
    paddingVertical: 10,
    width: '100%',
  },
  title: {
    fontSize: FontSize.md,
    fontFamily: 'Inter-600',
  },
  logoutBg: {},
  opacityBg: {},
  card: {
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
    fontSize: FontSize.base,
    marginTop: 2,
    fontFamily: 'Inter-500',
  },
  contentContainer: {
    padding: 12,
  },

  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  subTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
});