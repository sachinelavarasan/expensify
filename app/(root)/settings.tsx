import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import ProfileHeader from '@/components/ProfileHeader';
import {
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { deviceWidth } from '@/utils/functions';
import Spacer from '@/components/Spacer';
import CustomSwitch from '@/components/Switch';
import TimePickerPaperWithButton from '@/components/TimePickerPaperWithButton';

export default function Setting() {
  const [time, setTime] = useState('');
  const [reminder, setReminder] = useState(false);

  return (
    <KeyboardAvoidingView
      {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
      style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: 10 }}>
          <ProfileHeader title="Settings" />
          <ThemedView
            style={{
              flex: 1,
              paddingHorizontal: 10,
              backgroundColor: '#0F0E17',
            }}>
            <Spacer height={20} />
            <View style={{ gap: 20 }}>
              {/* General Section */}
              <View>
                <View>
                  <Text style={{ color: '#fff' }}>General</Text>
                </View>
                <View style={styles.subMenuContainer}>
                  <View style={styles.card}>
                    <View style={styles.left}>
                      <FontAwesome name="money" size={18} color="white" />
                      <View>
                        <Text style={styles.option}>Currency</Text>
                        <Text style={styles.subText}>Set your preferred currency symbol</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.card}>
                    <View style={styles.left}>
                      <FontAwesome name="exchange" size={18} color="white" />
                      <View>
                        <Text style={styles.option}>Default Transaction</Text>
                        <Text style={styles.subText}>Choose default type: Income or Expense</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.card}>
                    <View style={styles.left}>
                      <FontAwesome5 name="layer-group" size={18} color="white" />
                      <View>
                        <Text style={styles.option}>Default Grouping</Text>
                        <Text style={styles.subText}>
                          Group transactions by month, year, week, day, or custom range
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.card}>
                    <View style={styles.left}>
                      <MaterialCommunityIcons name="theme-light-dark" size={24} color="white" />
                      <View>
                        <Text style={styles.option}>Theme Setup</Text>
                        <Text style={styles.subText}>Switch between light and dark modes</Text>
                      </View>
                    </View>
                  </View>
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
                      <FontAwesome name="money" size={18} color="white" />
                      <View>
                        <Text style={styles.option}>Daily Reminder</Text>
                        <Text style={styles.subText}>
                          Get a daily notification to add transactions
                        </Text>
                      </View>
                    </View>
                    <View>
                      <CustomSwitch value={reminder} onChange={setReminder} />
                    </View>
                  </View>
                  <View style={{ marginBottom: 10 }}>
                    <TimePickerPaperWithButton
                      label="Reminder Time"
                      value={time}
                      onChange={(value) => {
                        setTime(value);
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
                      <MaterialIcons name="account-balance-wallet" size={18} color="white" />
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
                      <MaterialCommunityIcons name="calendar-arrow-right" size={18} color="white" />
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
                      <Ionicons name="time-outline" size={18} color="white" />
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
    paddingHorizontal: 10,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  subText: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 2,
  },
});
