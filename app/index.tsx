import { ThemedView } from '@/components/ThemedView';
import { useUser } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { ActivityIndicator } from 'react-native';

export default function Index() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <ThemedView style={{ flex: 1, justifyContent:'center' }}>
        <ActivityIndicator size="large" color="#6900FF" />
      </ThemedView>
    );
  }
  return isSignedIn ? (
    <Redirect href="/(root)/dashboard" />
  ) : (
    <Redirect href="/(root)/(auth)/login" />
  );
}
