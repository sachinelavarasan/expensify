import { KeyboardAvoidingView, Platform, View } from 'react-native';
import React, { useState } from 'react';

import { ThemedView } from '@/components/ThemedView';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import ProfileHeader from '@/components/ProfileHeader';
import SegmentedControl from '@/components/SegmentedControl';
import ExportTransactionsBody from '@/components/ExportTransactionsBody';
import ImportTransactionsBody from '@/components/ImportTransactionsBody';

type Tab = 'export' | 'import';

export default function ExportImportTransactions() {
  const [tab, setTab] = useState<Tab>('export');

  return (
    <KeyboardAvoidingView
      {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
      style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <ThemedView style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 15 }}>
            <ProfileHeader title="Export & Import" />
            <SegmentedControl
              options={[
                { id: 'export', label: 'Export' },
                { id: 'import', label: 'Import' },
              ]}
              value={tab}
              onChange={(id) => setTab(id as Tab)}
            />
          </View>
          {tab === 'export' ? <ExportTransactionsBody /> : <ImportTransactionsBody />}
        </ThemedView>
      </SafeAreaViewComponent>
    </KeyboardAvoidingView>
  );
}
