import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import ProfileHeader from '@/components/ProfileHeader';
import useCategoryList from '@/hooks/useCategoryList';

export default function Category() {
  const { categories, loading } = useCategoryList();
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  return (
    <SafeAreaViewComponent>
      {/* <ScrollView bounces={false} showsVerticalScrollIndicator={false}> */}
      <ThemedView
        style={{
          flex: 1,
          paddingHorizontal: 10,
        }}>
        <ProfileHeader title="Categories" />
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'income' && styles.activeTab]}
            onPress={() => setActiveTab('income')}>
            <Text style={[styles.tabText, activeTab === 'income' && styles.activeTabText]}>
              Income
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'expense' && styles.activeTab]}
            onPress={() => setActiveTab('expense')}>
            <Text style={[styles.tabText, activeTab === 'expense' && styles.activeTabText]}>
              Expense
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          contentContainerStyle={{
            paddingHorizontal: 10,
            marginTop: 10,
          }}
          data={categories}
          keyExtractor={(item) => item.exp_tc_label}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                console.log('first');
              }}>
              <View style={styles.left}>
                <View>
                  <Text style={styles.name}>{item.exp_tc_label}</Text>
                </View>
              </View>

              <View>
                <Text style={styles.amount}> =</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </ThemedView>
      {/* </ScrollView> */}
    </SafeAreaViewComponent>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#1e1a32',
    borderRadius: 8,
    padding: 5,
    marginHorizontal: 10,
  },
  tab: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#463e75',
    borderRadius: 8,
  },
  tabText: {
    color: '#B3B1C4',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  card: {
    padding: 10,
    marginBottom: 5,
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
  name: {
    color: '#F1F1F6',
    fontSize: 14,
    fontFamily: 'Inter-500',
  },
  subText: {
    color: '#B3B1C4',
    fontSize: 12,
    fontFamily: 'Inter-400',
  },
  subTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
});
