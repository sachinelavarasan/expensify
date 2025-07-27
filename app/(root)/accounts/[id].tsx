import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams } from 'expo-router';
import { Text, StyleSheet } from 'react-native';

export default function AccountScreen() {
  const { id } = useLocalSearchParams();

  return (
    <ThemedView style={styles.container}>
      <Text>Details of user {id} </Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
