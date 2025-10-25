import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import BLEContext from '@/providers/ble-context';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import React from 'react';
import ToastManager from 'toastify-react-native';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <BLEContext>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack>
          <Stack.Screen name="team/index" options={{ title: 'Team' }} />
          {/* <Stack.Screen name="device" options={{ headerShown: false }} /> */}
        </Stack>
        <ToastManager />
        <PortalHost />
      </BLEContext>
    </ThemeProvider>
  );
}
