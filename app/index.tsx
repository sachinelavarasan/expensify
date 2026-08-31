import { ThemedView } from '@/components/ThemedView';
import { useThemeContext } from '@/contexts/ThemedContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator } from 'react-native';

export default function Index() {
  const { isSignedIn, isBootstrapping } = useAuthContext();
  const { colors } = useThemeContext();
  if (isBootstrapping) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }
  return isSignedIn ? (
    <Redirect href="/(root)/dashboard" />
  ) : (
    <Redirect href="/(root)/(auth)/login" />
  );
}
