import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import ProfileHeader from '@/components/ProfileHeader';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Spacer from '@/components/Spacer';
import CustomSwitch from '@/components/Switch';
import TimePickerPaperWithButton from '@/components/TimePickerPaperWithButton';
import { deviceWidth, getAsyncValue, setAsyncValue } from '@/utils/functions';
import CurrencyModal from '@/components/CurrencyModal';
import DefaultTransactionModal from '@/components/DefaultTransactionModal';
import DefaultGroupingModal from '@/components/DefaultGroupingModal';
import { useGetUserData } from '@/hooks/useUserStore';
import { useReminderSettings } from '@/hooks/useReminder';
import ThemeToggle from '@/components/ThemeToggle';
import { useThemeContext } from '@/contexts/ThemedContext';
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
            <View style={{ gap: 20 }}>
              <ThemeToggle />
              {/* General Section */}
              <View>
                <View>
                  <Text style={{ color: colors.text, fontFamily: 'Inter-500' }}>General</Text>
                </View>
                <View style={styles.subMenuContainer}>
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

                  {/* <TouchableOpacity style={styles.card}>
                    <View style={styles.left}>
                      <MaterialCommunityIcons name="theme-light-dark" size={24} color="white" />
                      <View>
                        <Text style={styles.option}>Theme Setup</Text>
                        <Text style={styles.subText}>Switch between light and dark modes</Text>
                      </View>
                    </View>
                  </TouchableOpacity> */}
                </View>
              </View>

              {/* Reminder Section */}
              <View>
                <View>
                  <Text style={{ color: colors.text, fontFamily: 'Inter-500' }}>Reminder</Text>
                </View>
                <View style={styles.subMenuContainer}>
                  <View style={styles.card}>
                    <View style={styles.left}>
                      <MaterialIcons name="access-alarm" size={22} color={colors.text} />
                      <View>
                        <Text style={[styles.option, { color: colors.title }]}>Daily Reminder</Text>
                        <Text style={[styles.subText, { color: colors.description }]}>
                          Get a daily notification to add transactions
                        </Text>
                      </View>
                    </View>
                    <View>
                      <CustomSwitch
                        value={enabled}
                        onChange={(value) => {
                          if (value) {
                            scheduleNotification();
                          } else disableNotification();
                        }}
                      />
                    </View>
                  </View>
                  <View>
                    <TimePickerPaperWithButton
                      label="Reminder Time"
                      value={time}
                      onChange={(value) => {
                        scheduleNotification(value);
                      }}
                      disabled={!enabled}
                    />
                  </View>
                </View>
              </View>

              {/* Display Customization Section */}
              <View>
                <View>
                  <Text style={{ color: colors.text, fontFamily: 'Inter-500' }}>
                    Display Customization
                  </Text>
                </View>
                <View style={styles.subMenuContainer}>
                  <View style={styles.card}>
                    <View style={styles.left}>
                      <MaterialIcons name="account-balance-wallet" size={22} color={colors.text} />
                      <View>
                        <Text style={[styles.option, { color: colors.title }]}>Hide Balance</Text>
                        <Text style={[styles.subText, { color: colors.description }]}>
                          Toggle visibility of your total balance
                        </Text>
                      </View>
                    </View>
                    <View>
                      <CustomSwitch
                        value={showBalance}
                        onChange={(value) => {
                          updateSettingPreference('balance', value);
                        }}
                      />
                    </View>
                  </View>
                  <View style={styles.card}>
                    <View style={styles.left}>
                      <MaterialCommunityIcons
                        name="calendar-arrow-right"
                        size={22}
                        color={colors.text}
                      />
                      <View>
                        <Text style={[styles.option, { color: colors.title }]}>
                          Carry Over Balance
                        </Text>
                        <Text style={[styles.subText, { color: colors.description }]}>
                          Move unused balance to the next period
                        </Text>
                      </View>
                    </View>
                    <View>
                      <CustomSwitch
                        value={carryBalance}
                        onChange={(value) => {
                          updateSettingPreference('over-balance', value);
                        }}
                      />
                    </View>
                  </View>
                  <View style={styles.card}>
                    <View style={styles.left}>
                      <Ionicons name="time-outline" size={22} color={colors.text} />
                      <View>
                        <Text style={[styles.option, { color: colors.title }]}>
                          Show Transaction Time
                        </Text>
                        <Text style={[styles.subText, { color: colors.description }]}>
                          Display the time along with each transaction
                        </Text>
                      </View>
                    </View>
                    <View>
                      <CustomSwitch
                        value={ttime}
                        onChange={(value) => {
                          updateSettingPreference('tt-time', value);
                        }}
                      />
                    </View>
                  </View>
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
  card: {
    paddingVertical: 8,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
  },
  amount: {
    color: '#A0A0A0',
    fontSize: 14,
    fontFamily: 'Inter-500',
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    maxWidth: deviceWidth() * 0.6,
  },
  option: {
    color: '#F1F1F6',
    fontSize: 14,
    fontFamily: 'Inter-600',
  },
  subTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  subMenuContainer: {
    paddingLeft: 10,
    paddingVertical: 4,
  },
  subText: {
    fontSize: 12,
    color: '#ccc',
    fontFamily: 'Inter-500',
    marginTop: 2,
  },
});
