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
import React, { useEffect, useMemo, useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { format } from 'date-fns';

import { ThemedView } from '@/components/ThemedView';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import ProfileHeader from '@/components/ProfileHeader';
import Spacer from '@/components/Spacer';
import {
  useExportExcelTransactions,
  useExportPdfTransactions,
} from '@/hooks/useExportTransactions';
import DatePickerWithOutValue from '@/components/DatePickerWithOutValue';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';
import { DATE_RANGE_PRESETS as DATE_PRESETS, DateRangePresetId as PresetId, getPresetRange } from '@/utils/functions';

const FORMAT_OPTIONS: {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
}[] = [
  { id: 'pdf', label: 'PDF', icon: 'picture-as-pdf' },
  { id: 'xlsx', label: 'Excel', icon: 'grid-on' },
  { id: 'csv', label: 'CSV', icon: 'description' },
];

const TRAN_TYPE_OPTIONS: {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
}[] = [
  { id: 'all', label: 'All', icon: 'swap-vert' },
  { id: 'income', label: 'Income', icon: 'trending-up' },
  { id: 'expense', label: 'Expense', icon: 'trending-down' },
  { id: 'transfer', label: 'Transfer', icon: 'swap-horiz' },
];

export default function ExportData() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const { mutateAsync: exportExcelMutation, isPending } = useExportExcelTransactions();
  const { mutateAsync: exportPdfMutation, isPending: isPdfLoading } = useExportPdfTransactions();
  const [preset, setPreset] = useState<PresetId>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [docType, setDoctype] = useState<string>('pdf');
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

  const { start, end } = useMemo(() => {
    if (preset === 'custom') return { start: customStart, end: customEnd };
    return getPresetRange(preset) ?? { start: '', end: '' };
  }, [preset, customStart, customEnd]);

  const rangeLabel = useMemo(() => {
    if (!start || !end) return '';
    if (start === end) return format(new Date(start), 'EEE, MMM d, yyyy');
    return `${format(new Date(start), 'MMM d, yyyy')}  →  ${format(new Date(end), 'MMM d, yyyy')}`;
  }, [start, end]);

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
          break;
        case 'csv':
          await exportExcelMutation({
            startDate: start,
            endDate: end,
            fileType: 'csv',
            tranType,
          });
          break;
        default:
          await exportPdfMutation({
            startDate: start,
            endDate: end,
            tranType,
          });
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
              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
                ]}>
                <Text style={[styles.sectionLabel, { color: colors.description }]}>Date Range</Text>
                <View style={styles.chipRow}>
                  {DATE_PRESETS.map((item) => {
                    const selected = preset === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => setPreset(item.id)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: selected ? colors.primary : colors.cardBg,
                            borderColor: selected ? colors.primary : colors.inputBorder,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.chipLabel,
                            { color: selected ? colors.onPrimary : colors.title },
                          ]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {preset === 'custom' ? (
                  <>
                    <Spacer height={14} />
                    <DatePickerWithOutValue
                      label="From:"
                      onChange={(data: string) => setCustomStart(data)}
                      value={customStart}
                      placeholder="Start date"
                    />
                    <Spacer height={10} />
                    <DatePickerWithOutValue
                      label="To:"
                      onChange={(data: string) => setCustomEnd(data)}
                      value={customEnd}
                      placeholder="End date"
                      minimumDate={customStart}
                    />
                  </>
                ) : (
                  !!rangeLabel && (
                    <>
                      <Spacer height={12} />
                      <View
                        style={[
                          styles.rangeSummary,
                          { backgroundColor: colors.cardBg, borderColor: colors.inputBorder },
                        ]}>
                        <MaterialIcons name="date-range" size={16} color={colors.primary} />
                        <Text style={[styles.rangeSummaryText, { color: colors.title }]}>
                          {rangeLabel}
                        </Text>
                      </View>
                    </>
                  )
                )}
              </View>

              <Spacer height={20} />
              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
                ]}>
                <Text style={[styles.sectionLabel, { color: colors.description }]}>Format</Text>
                <View style={styles.chipRow}>
                  {FORMAT_OPTIONS.map((item) => {
                    const selected = docType === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => setDoctype(item.id)}
                        style={[
                          styles.iconChip,
                          {
                            backgroundColor: selected ? colors.primary : colors.cardBg,
                            borderColor: selected ? colors.primary : colors.inputBorder,
                          },
                        ]}>
                        <MaterialIcons
                          name={item.icon}
                          size={18}
                          color={selected ? colors.onPrimary : colors.title}
                        />
                        <Text
                          style={[
                            styles.chipLabel,
                            { color: selected ? colors.onPrimary : colors.title },
                          ]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <Spacer height={20} />
              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.inputColor, borderColor: colors.inputBorder },
                ]}>
                <Text style={[styles.sectionLabel, { color: colors.description }]}>
                  Transaction Type
                </Text>
                <View style={styles.chipRow}>
                  {TRAN_TYPE_OPTIONS.map((item) => {
                    const selected = tranType === item.id;
                    const accent =
                      item.id === 'income'
                        ? colors.income
                        : item.id === 'expense'
                          ? colors.expense
                          : item.id === 'transfer'
                            ? colors.transfer
                            : colors.primary;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => setTranType(item.id)}
                        style={[
                          styles.iconChip,
                          {
                            backgroundColor: selected ? accent : colors.cardBg,
                            borderColor: selected ? accent : colors.inputBorder,
                          },
                        ]}>
                        <MaterialIcons
                          name={item.icon}
                          size={18}
                          color={selected ? colors.onPrimary : colors.title}
                        />
                        <Text
                          style={[
                            styles.chipLabel,
                            { color: selected ? colors.onPrimary : colors.title },
                          ]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
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
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 14,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  iconChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipLabel: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-600',
  },
  rangeSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  rangeSummaryText: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-500',
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
