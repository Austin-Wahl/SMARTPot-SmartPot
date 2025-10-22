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
        {/* <DeviceListing /> */}
        <TestingHook />
      </View>
    </>
  );
}

const TestingHook = () => {
  const { startDeviceScan, refreshDevices, status, detectedSmartPots } = useBluetoothLE();
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

const SCAN_INTERVAL_MS = 5000;
const DEVICE_EXPIRATION_MS = 10000;
const CLEANUP_INTERVAL_MS = DEVICE_EXPIRATION_MS / 2;

const DeviceListing = () => {
  const { colorScheme } = useColorScheme();
  const { bleManager, startDeviceScan: test } = useBluetoothLE();
  const [bluetoothState, setBluetoothState] = useState<State>(State.Unknown);
  const [smartPots, setSmartPots] = useState<DeviceWithLastSeen[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const scanTimeoutRef = useRef<number | null>(null);
  const cleanupIntervalRef = useRef<number | null>(null);

  // test();
  useEffect(() => {
    bleManager.state().then(setBluetoothState);

    const stateSubscription = bleManager.onStateChange((newState) => {
      setBluetoothState(newState);
      if (newState !== State.PoweredOn && isScanning) {
        bleManager.stopDeviceScan();
        setIsScanning(false);
      }
    }, true);

    return () => stateSubscription.remove();
  }, [isScanning]);

  const startDeviceScan = useCallback(async () => {
    if (isScanning || refreshing) return;
    if (bluetoothState == State.Unauthorized) return;
    if (bluetoothState !== State.PoweredOn) return;

    if (refreshing) {
      setSmartPots([]);
    }

    setIsScanning(true);
    console.log('Starting device scan...');

    const deviceFoundListener = (error: BleError | null, scannedDevice: Device | null) => {
      if (error) {
        console.error('Scan Error:', error);
        // stopDeviceScanAndClearTimers();
        return;
      }
      if (!scannedDevice || !scannedDevice.id) return;
      // console.log(scannedDevice)
      setSmartPots((prevSmartPots) => {
        const lastSeen = Date.now();
        const existingIndex = prevSmartPots.findIndex((d) => d.id === scannedDevice.id);

        const newDevice: DeviceWithLastSeen = { ...scannedDevice, lastSeen } as DeviceWithLastSeen;

        if (existingIndex > -1) {
          const updatedDevices = [...prevSmartPots];
          updatedDevices[existingIndex] = newDevice;
          return updatedDevices;
        } else {
          return [...prevSmartPots, newDevice];
        }
      });
    };

    bleManager.startDeviceScan(
      ['6360ec7b-a2b6-41d2-87c6-be45caf92838'],
      { allowDuplicates: true },
      deviceFoundListener
    );

    // scanTimeoutRef.current = setTimeout(() => {
    //   stopDeviceScanAndClearTimers();
    // }, SCAN_INTERVAL_MS);
  }, [isScanning, refreshing, bluetoothState]);

  const stopDeviceScanAndClearTimers = useCallback(() => {
    bleManager.stopDeviceScan();
    setIsScanning(false);
    setRefreshing(false);

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    console.log('Device scan stopped.');
  }, []);

  // useEffect(() => {
  //   cleanupIntervalRef.current = setInterval(() => {
  //     setSmartPots((prevSmartPots) => {
  //       const now = Date.now();
  //       return prevSmartPots.filter((device) => now - device.lastSeen < DEVICE_EXPIRATION_MS);
  //     });
  //   }, CLEANUP_INTERVAL_MS);

  //   return () => {
  //     if (cleanupIntervalRef.current) {
  //       clearInterval(cleanupIntervalRef.current);
  //     }
  //   };
  // }, []);

  // useEffect(() => {
  //   return () => {
  //     stopDeviceScanAndClearTimers();
  //   };
  // }, [stopDeviceScanAndClearTimers]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setSmartPots([]);
    await startDeviceScan();
  }, [startDeviceScan]);

  if (bluetoothState === State.PoweredOff) {
    return (
      <Alert icon={AlertCircle} variant="destructive">
        <AlertTitle>
          <Text>BlueTooth is disabled.</Text>
        </AlertTitle>
        <AlertDescription>
          <Text>Please turn on BlueTooth to continue.</Text>
        </AlertDescription>
      </Alert>
    );
  }
  if (bluetoothState === State.Unauthorized) {
    return (
      <Alert icon={AlertCircle} variant="destructive">
        <AlertTitle>
          <Text>BlueTooth is now allowed.</Text>
        </AlertTitle>
        <AlertDescription>
          <Text>Please enable BlueTooth for this app in settings.</Text>
        </AlertDescription>
      </Alert>
    );
  }
  if (bluetoothState !== State.PoweredOn) {
    return (
      <Alert icon={AlertCircle} variant="destructive">
        <AlertTitle>
          <Text>BlueTooth is disabled.</Text>
        </AlertTitle>
        <AlertDescription>
          <Text>Please turn on BlueTooth to continue.</Text>
        </AlertDescription>
      </Alert>
    );
  }
  if (smartPots.length == 0 && (isScanning || refreshing)) {
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
  }

  if (!isScanning && !refreshing && smartPots.length == 0) {
    return (
      <View className="w-full items-center gap-4">
        <Text>No Devices Found</Text>
        <Button onPress={onRefresh}>
          <RotateCcw />
          <Text>Refresh</Text>
        </Button>
      </View>
    );
  }
  return (
    <ScrollView
      className="h-3/4 w-full"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="w-full flex-col gap-2">
        {smartPots.map((pot, index) => {
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
