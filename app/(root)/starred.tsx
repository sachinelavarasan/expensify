import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import ProfileHeader from '@/components/ProfileHeader';
import TransactionCard from '@/components/TransactionCard';
import Emptystate from '@/components/Emptystate';
import OverlayLoader from '@/components/Overlay';
import { useGetStarredTransactions } from '@/hooks/useStarredTransactions';

export default function Starred() {
  const { starred, isLoading, refetch } = useGetStarredTransactions();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      refetch();
      setRefreshing(false);
    }, 2000);
  }, [refetch]);

  return (
    <KeyboardAvoidingView
      {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
      style={{ flex: 1 }}>
      <SafeAreaViewComponent>
        <ThemedView
          style={{
            flex: 1,
            paddingHorizontal: 5,
          }}>
          {isLoading && <OverlayLoader />}
          <ProfileHeader title="Starred Transactions" />

          <FlatList
            bounces={false}
            scrollEnabled
            showsVerticalScrollIndicator={false}
            data={starred}
            contentContainerStyle={{ paddingBottom: 50, paddingTop: 5, paddingHorizontal: 15 }}
            ListEmptyComponent={
              <Emptystate
                title="No starred transactions added yet"
                description="Start by adding your income or expenses to see them here."
              />
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => {
              return (
                <View style={{ paddingVertical: 10 }}>
                  <TransactionCard key={item.exp_ts_id} {...item} isStarred/>
                </View>
              );
            }}
            keyExtractor={(item) => item.exp_ts_id.toString()}
          />
        </ThemedView>
      </SafeAreaViewComponent>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({});
