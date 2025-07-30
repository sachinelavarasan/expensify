import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar as ExpoStatus } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import ProfileHeader from '@/components/ProfileHeader';
import ToastMessage from '@/components/ToastMessage';

const EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
  );
}

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();
const error = console.error;
console.error = (...args: any) => {
  if (/defaultProps/.test(args[0])) return;
  error(...args);
};

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 200,
  fade: true,
});

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <LayoutBuilder />
    </ClerkProvider>
  );
}

function LayoutBuilder() {
  const { isLoaded: authLoaded } = useAuth();

  const [fontsLoaded] = useFonts({
    'Inter-100': require('../assets/fonts/Inter-Thin.ttf'),
    'Inter-200': require('../assets/fonts/Inter-ExtraLight.ttf'),
    'Inter-300': require('../assets/fonts/Inter-Light.ttf'),
    'Inter-400': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-500': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-600': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-700': require('../assets/fonts/Inter-Bold.ttf'),
    'Inter-800': require('../assets/fonts/Inter-ExtraBold.ttf'),
    'Inter-900': require('../assets/fonts/Inter-Black.ttf'),
  });

  useEffect(() => {
    const prepare = async () => {
      if (fontsLoaded && authLoaded) {
        await SplashScreen.hideAsync();
      }
    };
    prepare();
  }, [fontsLoaded, authLoaded]);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={DarkTheme}>
          <ExpoStatus />
          {authLoaded && fontsLoaded ? (
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(root)/(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(root)/dashboard" options={{ headerShown: false }} />
              <Stack.Screen name="(root)/transaction" options={{ headerShown: false }} />

              <Stack.Screen name="(root)/settings" />
              <Stack.Screen name="(root)/categories/index" />
              <Stack.Screen name="(root)/starred" />
              <Stack.Screen name="(root)/export-data" />
              <Stack.Screen name="(root)/accounts/[id]" />
              <Stack.Screen name="(root)/categories/[id]" />
            </Stack>
          ) : null}
          <ToastMessage/>
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
