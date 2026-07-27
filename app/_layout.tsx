import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
// import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import ToastMessage from '@/components/ToastMessage';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
import { ThemeProvider, useThemeContext } from '@/contexts/ThemedContext';
import NetworkInfoModal from '@/components/NetworkInfoModal';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { loadCurrencySettings } from '@/utils/functions';

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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 200,
  fade: true,
});

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <AuthProvider>
          <LayoutBuilder />
        </AuthProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

function LayoutBuilder() {
  const { isBootstrapping } = useAuthContext();

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
      if (fontsLoaded && !isBootstrapping) {
        await SplashScreen.hideAsync();
        await loadCurrencySettings();
      }
    };
    prepare();
  }, [fontsLoaded, isBootstrapping]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <BottomSheetModalProvider>
        {!isBootstrapping && fontsLoaded ? (
          <>
            <AppStack />
            <NetworkInfoModal />
          </>
        ) : null}
        <ToastMessage />
        </BottomSheetModalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function AppStack() {
  const { colors } = useThemeContext();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(root)/(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(root)/dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="(root)/transaction" options={{ headerShown: false }} />

      <Stack.Screen name="(root)/settings" />
      <Stack.Screen name="(root)/categories/index" />
      <Stack.Screen name="(root)/starred" />
      <Stack.Screen name="(root)/recurring-transactions" />
      <Stack.Screen name="(root)/recurring-transaction" />
      <Stack.Screen name="(root)/export-transactions" />
      <Stack.Screen name="(root)/import-transactions" options={{
        presentation: 'fullScreenModal'
      }}/>
      <Stack.Screen name="(root)/accounts/[id]" />
      <Stack.Screen name="(root)/categories/[id]" />
    </Stack>
  );
}
