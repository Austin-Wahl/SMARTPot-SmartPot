import PotDevice from '@/components/custom/pot-device';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Text } from '@/components/ui/text';
import useBluetoothLE from '@/hooks/useBluetoothLE';
import { DeviceWithLastSeen } from '@/types';
import { useFonts } from 'expo-font';
import { Link, SplashScreen, Stack } from 'expo-router';
import { ExtendedStackNavigationOptions } from 'expo-router/build/layouts/StackClient';
import { AlertCircle, Cog, Flower, Loader2, Moon, RotateCcw, Sun } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type ImageStyle, Platform, RefreshControl, ScrollView, View } from 'react-native';
import { BleError, Device, State } from 'react-native-ble-plx';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_OPTIONS: ExtendedStackNavigationOptions = {
  title: '',
  headerTransparent: true,
  headerRight: () => <SettingsMenu />,
};

export default function Screen() {
  const [loaded, error] = useFonts({
    Quicksand: require('../assets/fonts/Quicksand/Quicksand-VariableFont_wght.ttf'),
  });
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 gap-8 p-4" style={{ paddingTop: insets.top + 16 }}>
        {/* <Image source={LOGO[colorScheme ?? 'light']} style={IMAGE_STYLE} resizeMode="contain" /> */}
        <View className="flex h-1/4 items-center gap-4">
          <View className="flex h-[120px] w-[120px] items-center justify-center rounded-lg border-[1px] border-border">
            <Flower size={60} color="#22c55e" />
          </View>
          <Text>
            <Text className="font-extrabold" style={{ fontFamily: 'Quicksand' }}>
              SMART
            </Text>
            <Text className="text-quicksand text-green-500" style={{ fontFamily: 'Quicksand' }}>
              Pot
            </Text>
          </Text>
        </View>
        <Devices />
      </View>
    </>
  );
}

const Devices = () => {
  const { startDeviceScan, refreshDevices, status, detectedSmartPots, connectedDevice } =
    useBluetoothLE();
  useEffect(() => {
    startDeviceScan();
  }, []);

  if (detectedSmartPots.length == 0 && status !== 'scanning') {
    return (
      <View className="w-full items-center gap-4">
        <Text>No Devices Found</Text>
        <Button onPress={refreshDevices}>
          <RotateCcw />
          <Text>Refresh</Text>
        </Button>
      </View>
    );
  }
  return (
    <ScrollView className="h-3/4 w-full">
      {status === 'scanning' && <ScanningLoading />}
      <View className="w-full flex-col gap-2">
        {detectedSmartPots.map((pot, index) => {
          return <PotDevice pot={pot} key={index} />;
        })}
      </View>
    </ScrollView>
  );
};

const ScanningLoading = () => {
  const { colorScheme } = useColorScheme();

  return (
    <View className="flex w-full items-center gap-2 p-4">
      <Text className="text-muted-foreground">
        Scanning for{' '}
        <Text className="font-extrabold" style={{ fontFamily: 'Quicksand' }}>
          SMART
        </Text>
        <Text className="text-quicksand text-green-500" style={{ fontFamily: 'Quicksand' }}>
          Pots
        </Text>
      </Text>
      <View className="justify-centerduration-1000 flex w-full animate-spin items-center">
        <Loader2 color={colorScheme === 'dark' ? 'white' : 'black'} />
      </View>
    </View>
  );
};

function SettingsMenu() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="ios:size-9 rounded-full web:mx-4">
          <Cog color={colorScheme === 'dark' ? 'white' : 'black'} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        className="bg-card"
        style={{
          position: Platform.OS !== 'web' ? 'absolute' : undefined,
          top: Platform.OS !== 'web' ? insets.top + 60 : undefined,
        }}>
        <DropdownMenuLabel>
          <Text className="text-sm">Info</Text>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Text>Theme</Text>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onPressIn={() => {
                console.log('clicked');
                toggleColorScheme();
              }}>
              <Text>Dark</Text>
              <Moon />
            </DropdownMenuItem>
            <DropdownMenuItem onPressIn={toggleColorScheme}>
              <Text>Light</Text>
              <Sun />
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem asChild>
          <Link href="/team">
            <Text>Team</Text>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
