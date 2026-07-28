import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import ProfileHeader from '@/components/ProfileHeader';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Spacer from '@/components/Spacer';
import CustomSwitch from '@/components/Switch';
import SettingsRow from '@/components/SettingsRow';
import TimePickerPaperWithButton from '@/components/TimePickerPaperWithButton';
import { getAsyncValue, setAsyncValue } from '@/utils/functions';
import CurrencyModal from '@/components/CurrencyModal';
import DefaultTransactionModal from '@/components/DefaultTransactionModal';
import DefaultGroupingModal from '@/components/DefaultGroupingModal';
import { useGetUserData } from '@/hooks/useUserStore';
import { useReminderSettings } from '@/hooks/useReminder';
import ThemeToggle from '@/components/ThemeToggle';
import { useThemeContext } from '@/contexts/ThemedContext';
import { FontSize } from '@/utils/Typography';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Setting() {
  const { colors } = useThemeContext();
  const { enabled, time, scheduleNotification, disableNotification } = useReminderSettings();
  const [showBalance, setShowBalance] = useState(false);
  const [carryBalance, setCarryBalance] = useState(false);
  const [generalSettings, setGeneralSettings] = useState<{
    currency: string;
    grouping: string;
    d_transaction: string;
  }>({
    currency: '',
    grouping: '',
    d_transaction: '',
  });
  const [ttime, setTtime] = useState(false);
  const { user, refetch } = useGetUserData();

  const updateSettingPreference = useCallback(async (name: string, value: boolean | string) => {
    switch (name) {
      case 'balance':
        setShowBalance(value as boolean);
        break;
      case 'over-balance':
        setCarryBalance(value as boolean);
        break;

      case 'tt-time':
        setTtime(value as boolean);
        break;
      case 'currency':
        if (typeof value === 'string')
          setGeneralSettings({
            ...generalSettings,
            currency: value,
          });
        await AsyncStorage.setItem('currency', String(value));
        break;
      case 'grouping':
        if (typeof value === 'string')
          setGeneralSettings({
            ...generalSettings,
            grouping: value,
          });
        break;
      case 'd_transaction':
        if (typeof value === 'string')
          setGeneralSettings({
            ...generalSettings,
            d_transaction: value,
          });
        break;
    }
    if (name !== 'currency') setAsyncValue(name, JSON.stringify(value));
  }, []);

  useEffect(() => {
    const getValuesFromStore = async () => {
      const balance = await getAsyncValue('balance');
      const overBalance = await getAsyncValue('over-balance');
      const ttTime = await getAsyncValue('tt-time');
      const currency = await AsyncStorage.getItem('currency');
      const grouping = await getAsyncValue('grouping');
      const d_transaction = await getAsyncValue('d_transaction');
      if (balance) {
        setShowBalance(JSON.parse(balance));
      }
      if (overBalance) {
        setCarryBalance(JSON.parse(overBalance));
      }
      if (ttTime) {
        setTtime(JSON.parse(ttTime));
      }
      if (currency) {
        setGeneralSettings((prev) => ({
          ...prev,
          currency: user?.exp_us_currency ? user?.exp_us_currency : currency ? currency : '',
        }));
      }
      if (grouping) {
        setGeneralSettings((prev) => ({
          ...prev,
          grouping: JSON.parse(grouping) ? JSON.parse(grouping) : '',
        }));
      }
      if (d_transaction) {
        setGeneralSettings((prev) => ({
          ...prev,
          d_transaction: JSON.parse(d_transaction) ? JSON.parse(d_transaction) : '',
        }));
      }
    };
    getValuesFromStore();
  }, [user]);

  return (
    <KeyboardAvoidingView
      {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
      style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          <ThemedView
            style={{
              flex: 1,
              paddingBottom: 40,
              paddingHorizontal: 20,
            }}>
            <ProfileHeader title="Settings" paddingHorizontal={false} />
            <Spacer height={20} />
            <View style={{ gap: 22 }}>
              {/* Appearance Section */}
              <View>
                <Text style={[styles.sectionLabel, { color: colors.description }]}>Appearance</Text>
                <View style={styles.section}>
                  <ThemeToggle />
                </View>
              </View>

              {/* General Section */}
              <View>
                <Text style={[styles.sectionLabel, { color: colors.description }]}>General</Text>
                <View style={styles.section}>
                  <CurrencyModal
                    currency={generalSettings?.currency}
                    refetch={refetch}
                    updateSettings={updateSettingPreference}
                  />
                  <DefaultTransactionModal
                    transaction_type={Number(generalSettings?.d_transaction)}
                    label={Number(generalSettings?.d_transaction) === 2 ? 'Income' : 'Expense'}
                    refetch={refetch}
                    updateSettings={updateSettingPreference}
                  />
                  <DefaultGroupingModal
                    grouping={generalSettings?.grouping}
                    refetch={refetch}
                    updateSettings={updateSettingPreference}
                  />
                </View>
              </View>

              {/* Reminder Section */}
              <View>
                <Text style={[styles.sectionLabel, { color: colors.description }]}>Reminder</Text>
                <View style={styles.section}>
                  <SettingsRow
                    icon={<MaterialIcons name="access-alarm" size={18} color={colors.onPrimary} />}
                    title="Daily Reminder"
                    subtitle={
                      enabled
                        ? `Reminds you daily at ${time}`
                        : 'Get a daily notification to add transactions'
                    }
                    right={
                      <View style={{ alignItems: 'flex-end', gap: 8 }}>
                        <CustomSwitch
                          value={enabled}
                          onChange={(value) => {
                            if (value) {
                              scheduleNotification();
                            } else disableNotification();
                          }}
                        />
                        <View style={!enabled ? { opacity: 0.4 } : undefined}>
                          <TimePickerPaperWithButton
                            value={time}
                            onChange={(value) => {
                              scheduleNotification(value);
                            }}
                            disabled={!enabled}
                          />
                        </View>
                      </View>
                    }
                  />
                </View>
              </View>

              {/* Display Customization Section */}
              <View>
                <Text style={[styles.sectionLabel, { color: colors.description }]}>
                  Display Customization
                </Text>
                <View style={styles.section}>
                  <SettingsRow
                    icon={
                      <MaterialIcons name="account-balance-wallet" size={18} color={colors.onPrimary} />
                    }
                    title="Hide Balance"
                    subtitle="Toggle visibility of your total balance"
                    right={
                      <CustomSwitch
                        value={showBalance}
                        onChange={(value) => {
                          updateSettingPreference('balance', value);
                        }}
                      />
                    }
                  />
                  <SettingsRow
                    icon={
                      <MaterialCommunityIcons
                        name="calendar-arrow-right"
                        size={18}
                        color={colors.onPrimary}
                      />
                    }
                    title="Carry Over Balance"
                    subtitle="Move unused balance to the next period"
                    right={
                      <CustomSwitch
                        value={carryBalance}
                        onChange={(value) => {
                          updateSettingPreference('over-balance', value);
                        }}
                      />
                    }
                  />
                  <SettingsRow
                    icon={<Ionicons name="time-outline" size={18} color={colors.onPrimary} />}
                    title="Show Transaction Time"
                    subtitle="Display the time along with each transaction"
                    right={
                      <CustomSwitch
                        value={ttime}
                        onChange={(value) => {
                          updateSettingPreference('tt-time', value);
                        }}
                      />
                    }
                  />
                </View>
              </View>
            </View>
          </ThemedView>
        </ScrollView>
      </SafeAreaViewComponent>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  section: {},
});
