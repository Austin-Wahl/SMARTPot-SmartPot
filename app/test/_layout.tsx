import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import BLEContext from '@/providers/ble-context';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ToastManager from 'toastify-react-native';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Stack>
      <Stack.Screen name="/test/index" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
