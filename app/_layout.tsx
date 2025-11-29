import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import BLEContext from '@/providers/ble-context';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ToastManager from 'toastify-react-native';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme('light');
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colorScheme === 'dark' ? 'hsl(0 0% 3.9%)' : 'hsl(0 0% 100%)',
      }}>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <BLEContext>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack>
            <Stack.Screen name="team/index" options={{ title: 'Team' }} />
            <Stack.Screen name="setup" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="device/[deviceId]/[localId]"
              options={{ headerBackTitle: 'Home' }}
            />
          </Stack>
          <ToastManager />
          <PortalHost />
        </BLEContext>
      </ThemeProvider>
    </SafeAreaView>
  );
}
