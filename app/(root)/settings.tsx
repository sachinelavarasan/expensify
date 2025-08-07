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
import { MaterialIcons } from '@expo/vector-icons';
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
            }}>
            <Spacer height={20} />

            <View style={styles.card}>
              <View style={styles.left}>
                <View>
                  <MaterialIcons name="access-alarm" size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.option}>Daily Reminder</Text>
                </View>
              </View>
              <View>
                <CustomSwitch value={reminder} onChange={setReminder} />
              </View>
            </View>

            <View style={{paddingHorizontal: 10}}>
              <TimePickerPaperWithButton
              label="Reminder Time"
              value={time}
              onChange={(value) => {
                setTime(value);
              }}
              disabled={!reminder}
            />
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
    marginBottom: 12,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  subText: {
    color: '#6F6D85',
    fontSize: 14,
    fontFamily: 'Inter-500',
    wordWrap: 'wrap',
    maxWidth: deviceWidth() - 80,
  },
  subTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
});
