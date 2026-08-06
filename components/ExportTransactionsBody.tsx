import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { format } from 'date-fns';

import Spacer from '@/components/Spacer';
import {
  useExportExcelTransactions,
  useExportPdfTransactions,
} from '@/hooks/useExportTransactions';
import { useGetUserBankAccounts } from '@/hooks/useBankAccountOperation';
import DatePickerCalendar from '@/components/DatePickerCalendar';
import { MaterialIcons } from '@expo/vector-icons';
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

export default function ExportTransactionsBody() {
  const { colors } = useThemeContext();
  const { mutateAsync: exportExcelMutation, isPending } = useExportExcelTransactions();
  const { mutateAsync: exportPdfMutation, isPending: isPdfLoading } = useExportPdfTransactions();
  const { accounts } = useGetUserBankAccounts();
  const [preset, setPreset] = useState<PresetId>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [docType, setDoctype] = useState<string>('pdf');
  const [tranType, setTranType] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [hasInitializedAccounts, setHasInitializedAccounts] = useState(false);

  // Defaults to every account selected, once the account list is available -
  // matches the same default-all-selected pattern used on Import Recurring.
  useEffect(() => {
    if (!hasInitializedAccounts && accounts.length > 0) {
      setSelectedAccountIds(accounts.map((a) => a.exp_ba_id));
      setHasInitializedAccounts(true);
    }
  }, [accounts, hasInitializedAccounts]);

  const allAccountsSelected = accounts.length > 0 && selectedAccountIds.length === accounts.length;

  const toggleAccount = (id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id],
    );
  };

  const toggleAllAccounts = () => {
    setSelectedAccountIds(allAccountsSelected ? [] : accounts.map((a) => a.exp_ba_id));
  };

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
    if (!start || !end || selectedAccountIds.length === 0) {
      return;
    }
    setErrorMessage('');
    const accountIds = allAccountsSelected ? undefined : selectedAccountIds;
    try {
      switch (docType) {
        case 'xlsx':
          await exportExcelMutation({
            startDate: start,
            endDate: end,
            fileType: 'xlsx',
            tranType,
            accountIds,
          });
          break;
        case 'csv':
          await exportExcelMutation({
            startDate: start,
            endDate: end,
            fileType: 'csv',
            tranType,
            accountIds,
          });
          break;
        default:
          await exportPdfMutation({
            startDate: start,
            endDate: end,
            accountIds,
            tranType,
          });
          break;
      }
    } catch {
      setErrorMessage('Something went wrong while exporting your transactions. Please try again.');
    }
  }

  return (
    <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20 }}>
        <Spacer height={10} />
        <Animated.View style={cardAnimatedStyle}>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
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
                        borderColor: selected ? colors.primary : colors.borderColor,
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
                <DatePickerCalendar
                  label="From:"
                  onChange={(data: string) => setCustomStart(data)}
                  value={customStart}
                  placeholder="Start date"
                />
                <Spacer height={10} />
                <DatePickerCalendar
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
                      { backgroundColor: colors.inputColor, borderColor: colors.borderColor },
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
              { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
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
                        borderColor: selected ? colors.primary : colors.borderColor,
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
              { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
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
                        borderColor: selected ? accent : colors.borderColor,
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

          {accounts.length > 1 && (
            <>
              <Spacer height={20} />
              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
                ]}>
                <View style={styles.cardLabelRow}>
                  <Text style={[styles.sectionLabel, { color: colors.description, marginBottom: 0 }]}>
                    Account
                  </Text>
                  <TouchableOpacity onPress={toggleAllAccounts}>
                    <Text style={[styles.selectAllText, { color: colors.primary }]}>
                      {allAccountsSelected ? 'Deselect All' : 'Select All'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Spacer height={10} />
                <View style={styles.chipRow}>
                  {accounts.map((account) => {
                    const selected = selectedAccountIds.includes(account.exp_ba_id);
                    return (
                      <TouchableOpacity
                        key={account.exp_ba_id}
                        onPress={() => toggleAccount(account.exp_ba_id)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: selected ? colors.primary : colors.cardBg,
                            borderColor: selected ? colors.primary : colors.borderColor,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.chipLabel,
                            { color: selected ? colors.onPrimary : colors.title },
                          ]}>
                          {account.exp_ba_name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          <Spacer height={16} />
          <View style={[styles.recap, { backgroundColor: `${colors.primary}1F` }]}>
            <MaterialIcons name="info-outline" size={16} color={colors.primary} />
            <Text style={[styles.recapText, { color: colors.title }]}>
              Ready to export{' '}
              <Text style={{ fontFamily: 'Inter-700', color: colors.primary }}>
                {TRAN_TYPE_OPTIONS.find((o) => o.id === tranType)?.label}
              </Text>{' '}
              transactions as{' '}
              <Text style={{ fontFamily: 'Inter-700', color: colors.primary }}>
                {FORMAT_OPTIONS.find((o) => o.id === docType)?.label}
              </Text>
              {!!rangeLabel && (
                <>
                  {' '}
                  for{' '}
                  <Text style={{ fontFamily: 'Inter-700', color: colors.primary }}>
                    {rangeLabel}
                  </Text>
                </>
              )}
              {accounts.length > 1 && !allAccountsSelected && (
                <>
                  {' '}
                  from{' '}
                  <Text style={{ fontFamily: 'Inter-700', color: colors.primary }}>
                    {selectedAccountIds.length} of {accounts.length} accounts
                  </Text>
                </>
              )}
              .
            </Text>
          </View>
        </Animated.View>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              isPdfLoading || isPending || !start || !end || selectedAccountIds.length === 0
                ? styles.disable
                : {},
            ]}
            disabled={!start || !end || selectedAccountIds.length === 0}
            onPress={download}>
            {isPdfLoading || isPending ? (
              <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
            ) : null}
            <Text
              style={[
                styles.title,
                { color: colors.onPrimary },
                isPdfLoading || isPending ? styles.textDisable : {},
              ]}>
              Export Now
            </Text>
          </TouchableOpacity>
          {!!errorMessage && (
            <Text style={[styles.subText, { color: colors.expense, textAlign: 'center', marginTop: 8 }]}>
              {errorMessage}
            </Text>
          )}
        </View>
        <Spacer height={100} />
      </View>
    </ScrollView>
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
  cardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectAllText: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
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
  recap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  recapText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    lineHeight: 18,
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
});
