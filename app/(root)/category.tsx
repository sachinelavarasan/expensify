import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import React from 'react';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import ProfileHeader from '@/components/ProfileHeader';

export default function Category() {
  return (
    // <KeyboardAvoidingView
    //   {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
    //   style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          <ThemedView
            style={{
              flex: 1,
              paddingHorizontal: 5,
            }}>
            <ProfileHeader title="Categories" />
          </ThemedView>
        </ScrollView>
      </SafeAreaViewComponent>
    // </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({});
