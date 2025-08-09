import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import ProfileHeader from '@/components/ProfileHeader';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Spacer from '@/components/Spacer';
import CustomSwitch from '@/components/Switch';
import TimePickerPaperWithButton from '@/components/TimePickerPaperWithButton';
import { deviceWidth } from '@/utils/functions';
import CurrencyModal from '@/components/CurrencyModal';
import DefaultTransactionModal from '@/components/DefaultTransactionModal';
import DefaultGroupingModal from '@/components/DefaultGroupingModal';
import { registerForPushNotificationsAsync } from '@/utils/registerForPushNotificationsAsync';
import { useDisableNotificationToken, useEnableNotificationToken } from '@/hooks/useSettings';

export default function Setting() {
  const [time, setTime] = useState('');
  const [reminder, setReminder] = useState(false);
  const { mutateAsync: enableNotification } = useEnableNotificationToken();
  const { mutateAsync: disableNotification } = useDisableNotificationToken();

  const handleEnable = (times: string) => {
    if(!times) return;
    registerForPushNotificationsAsync().then(
      (token) => {
        setTime(times);
        if (token && times) enableNotification({ token, time: times });
      },
      (error) => alert('Failed to enable push notification!'),
    );
  };
  const handleDisable = () => {
    registerForPushNotificationsAsync().then(
      (token) => {
        if (token) disableNotification(token);
      },
      (error) => alert('Failed to disable reminder notification'),
    );
  };

  
  return (
    <KeyboardAvoidingView
      {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
      style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          <ProfileHeader title="Settings" />
          <ThemedView
            style={{
              flex: 1,
              paddingBottom: 40,
              paddingHorizontal: 20,
            }}>
            <Spacer height={20} />
            <View style={{ gap: 20 }}>
              {/* General Section */}
              <View>
                <View>
                  <Text style={{ color: '#fff' }}>General</Text>
                </View>
                <View style={styles.subMenuContainer}>
                  <CurrencyModal />
                  <DefaultTransactionModal />
                  <DefaultGroupingModal />

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
                  <Text style={{ color: '#fff' }}>Reminder</Text>
                </View>
                <View style={styles.subMenuContainer}>
                  <View style={styles.card}>
                    <View style={styles.left}>
                      <MaterialIcons name="access-alarm" size={20} color="white" />
                      <View>
                        <Text style={styles.option}>Daily Reminder</Text>
                        <Text style={styles.subText}>
                          Get a daily notification to add transactions
                        </Text>
                      </View>
                    </View>
                    <View>
                      <CustomSwitch value={reminder} onChange={(value)=>{
                        setReminder(value)
                        if(!value) handleDisable()
                      }} />
                    </View>
                  </View>
                  <View style={{ marginBottom: 10 }}>
                    <TimePickerPaperWithButton
                      label="Reminder Time"
                      value={time}
                      onChange={(value) => {
                        handleEnable(value);
                      }}
                      disabled={!reminder}
                    />
                  </View>
                </View>
              </View>

              {/* Display Customization Section */}
              <View>
                <View>
                  <Text style={{ color: '#fff' }}>Display Customization</Text>
                </View>
                <View style={styles.subMenuContainer}>
                  <View style={styles.card}>
                    <View style={styles.left}>
                      <MaterialIcons name="account-balance-wallet" size={20} color="white" />
                      <View>
                        <Text style={styles.option}>Show Balance</Text>
                        <Text style={styles.subText}>Toggle visibility of your total balance</Text>
                      </View>
                    </View>
                    <View>
                      <CustomSwitch value={reminder} onChange={setReminder} />
                    </View>
                  </View>
                  <View style={styles.card}>
                    <View style={styles.left}>
                      <MaterialCommunityIcons name="calendar-arrow-right" size={20} color="white" />
                      <View>
                        <Text style={styles.option}>Carry Over Balance</Text>
                        <Text style={styles.subText}>Move unused balance to the next period</Text>
                      </View>
                    </View>
                    <View>
                      <CustomSwitch value={reminder} onChange={setReminder} />
                    </View>
                  </View>
                  <View style={styles.card}>
                    <View style={styles.left}>
                      <Ionicons name="time-outline" size={20} color="white" />
                      <View>
                        <Text style={styles.option}>Show Transaction Time</Text>
                        <Text style={styles.subText}>
                          Display the time along with each transaction
                        </Text>
                      </View>
                    </View>
                    <View>
                      <CustomSwitch value={reminder} onChange={setReminder} />
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
    marginTop: 2,
  },
});
