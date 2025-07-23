import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';

const Budget = () => {
  return (
    <ThemedView style={{ flex: 1, paddingTop: StatusBar.currentHeight, paddingHorizontal: 20 }}>
      <Text style={styles.title}>Budget</Text>
      <View style={styles.budgetContainer}>
        <Text style={styles.budgetText}>Total Budget: $1000</Text>
        <Text style={styles.budgetText}>Spent: $400</Text>
        <Text style={styles.budgetText}>Remaining: $600</Text>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  budgetContainer: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  budgetText: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default Budget;
