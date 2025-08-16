import React, { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DatePicker, { getFormatedDate } from 'react-native-modern-datepicker';

export default function CustomTimePicker({
  onDateChange,
  value = '',
  borderLess = true,
  label,
  placeholder,
  error,
  isRequired = false,
}: {
  onDateChange: (date: string) => void;
  value?: string;
  borderLess?: boolean;
  label?: string;
  placeholder?: string;
  error?: string;
  isRequired?: boolean;
}) {
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };
  const [selectedDate, setSelectedDate] = useState(value || getCurrentTime());
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const toggleDatePicker = () => {
    setDatePickerVisible(!datePickerVisible);
  };

  const handleConfirm = (date: string) => {
    if (date) {
      setSelectedDate(date);
      onDateChange(date);
    }
    toggleDatePicker();
  };
  function formatDate(date: string) {
    if (!date) return '';
    return date;
  }
  return (
    <View>
      {label ? (
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <Text style={styles.label}>{label}</Text>
          {/* {isRequired ? (
            <View style={{ marginLeft: 5, marginTop: 5 }}>
              <Image
                source={require('@/assets/icons/required.png')}
                style={{ width: 8, height: 8 }}
              />
            </View>
          ) : null} */}
        </View>
      ) : null}
      <Pressable
        onPress={() => {
          toggleDatePicker();
        }}
        style={[styles.inputContainer, borderLess ? styles.borderNone : null, styles.innerView]}>
        {selectedDate ? (
          <Text style={styles.input}>{selectedDate}</Text>
        ) : (
          <Text style={[styles.input, styles.placeholder]}>{placeholder}</Text>
        )}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {datePickerVisible && (
        <View style={{ bottom: -10 }}>
          <DatePicker
            onTimeChange={(date) => handleConfirm(date)}
            options={{
              backgroundColor: '#0E0E10',
              textHeaderColor: '#6900FF',
              textDefaultColor: '#717171',
              selectedTextColor: '#0E0E10',
              mainColor: '#0E0E10',
              textSecondaryColor: '#6900FF',
              borderColor: '#606060',
            }}
            minuteInterval={1}
            current={selectedDate}
            selected={selectedDate}
            mode="time"
            style={{ borderRadius: 10, borderColor: '#3A3A54', borderWidth: 1 }}
          />
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  inputContainer: {
    borderColor: '#F2F2F2',
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 0,
  },
  innerView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 0,
    paddingVertical: Platform.OS === 'android' ? 12 : 15,
    fontSize: 16,
    fontFamily: 'Inter-500',
    color: '#717171',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    color: '#000',
    marginBottom: 6,
    fontFamily: 'Inter-400',
  },
  error: {
    fontSize: 12,
    color: '#f02d3a',
    marginTop: 5,
    fontFamily: 'Inter-300',
    letterSpacing: 0.5,
  },
  borderNone: {
    borderWidth: 0,
    backgroundColor: '#1E1E1E',
  },
  // titleText: {
  //   fontSize: 15,
  // },
  placeholder: {
    color: '#717171',
  },
});
