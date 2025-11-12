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
import base64ToUUID from '@/lib/bytearray-to-uuid';
import { ILocalStoragePlantRecord } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Link, SplashScreen, Stack, useRouter } from 'expo-router';
import { ExtendedStackNavigationOptions } from 'expo-router/build/layouts/StackClient';
import { Cog, Flower2Icon, Loader2, Moon, Plus, Sun } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_OPTIONS: ExtendedStackNavigationOptions = {
  title: '',
  headerTransparent: true,
  headerRight: () => <SettingsMenu />,
};

export default function Screen() {
  const [loaded, error] = useFonts({
    Quicksand: require('../assets/fonts/Quicksand/Quicksand-VariableFont_wght.ttf'),
    Momo: require('../assets/fonts/MomoTrust/MomoTrustDisplay-Regular.ttf'),
  });
  const router = useRouter();
  const [devices, setDevices] = React.useState<
    Record<string, ILocalStoragePlantRecord & { deviceId?: string }>
  >({});
  const { colorScheme } = useColorScheme();
  const { init, detectedSmartPots, stopDeviceScan, status } = useBluetoothLE();

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  React.useEffect(() => {
    if (!loaded) return;

    init();

    return () => {
      stopDeviceScan();
    };
  }, [loaded, error]);

  React.useEffect(() => {
    if (!loaded) return;
    console.log(status);
    loadInDevices();
  }, [loaded, status]);

  const loadInDevices = async () => {
    for (const pot of detectedSmartPots) {
      // convert the bytearray (the smart pots static UUID) back to a c string UUID
      const uuid = base64ToUUID(pot.manufacturerData as string) as string;

      // Check if our database contains this UUID
      const data = await AsyncStorage.getItem('plants');
      let existingDevices: Record<string, ILocalStoragePlantRecord> = {};

      if (!data) return;
      existingDevices = JSON.parse(data) as Record<string, ILocalStoragePlantRecord>;

      if (existingDevices[uuid] == undefined) return;
      setDevices((prev) => {
        return {
          ...prev,
          [uuid]: {
            ...existingDevices[uuid],
            deviceId: pot.id,
          },
        };
      });
    }
  };

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerBackVisible: false,
          gestureEnabled: false,
          headerShown: false,
          title: 'Home',
        }}
      />
      <View className="mt-full relative h-full px-8">
        <View className="mt-12 gap-4">
          <Text
            className="text-nowrap text-6xl"
            style={{
              fontFamily: 'Momo',
            }}>
            Welcome!
          </Text>
        </View>
        <View className="my-12 h-full w-full gap-4">
          <View className="flex-row flex-wrap justify-between">
            <Text
              className="text-3xl text-orange-500"
              style={{
                fontFamily: 'Quicksand',
              }}>
              Your Devices
            </Text>
            <Button
              className="w-[100px]"
              onPress={() => {
                router.push({
                  pathname: '/setup',
                  params: {
                    allowExit: 'true',
                  },
                });
              }}>
              <Plus color={colorScheme === 'dark' ? 'black' : 'white'} />
              <Text>Add</Text>
            </Button>
          </View>
          <ScrollView
            className="h-full w-full"
            refreshControl={
              <RefreshControl
                refreshing={status == 'scanning'}
                onRefresh={() => {
                  setDevices({});
                  init();
                }}
              />
            }>
            <View className="gap-4">
              {Object.keys(devices).map((id) => {
                const dev = devices[id];
                return (
                  <Pressable
                    className="w-full rounded-lg border-[1px] border-border bg-muted p-4"
                    key={id}
                    onPress={() =>
                      router.push({
                        pathname: '/device/[deviceId]',
                        params: {
                          deviceId: dev.deviceId || '',
                        },
                      })
                    }>
                    <View className="flex-row gap-4">
                      <View>
                        <View className="h-[40px] w-[40px] items-center justify-center rounded-lg bg-muted-foreground/30">
                          <Flower2Icon />
                        </View>
                      </View>
                      <View>
                        <Text className="text-xl">{dev.name}</Text>
                        <Text className="text-muted-foreground">{dev.plant}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </>
  );
}

// const Devices = () => {
//   const { startDeviceScan, refreshDevices, status, detectedSmartPots, connectedDevice } =
//     useBluetoothLE();
//   useEffect(() => {
//     startDeviceScan();
//   }, []);

//   if (detectedSmartPots.length == 0 && status !== 'scanning') {
//     return (
//       <View className="w-full items-center gap-4">
//         <Text>No Devices Found</Text>
//         <Button onPress={refreshDevices}>
//           <RotateCcw />
//           <Text>Refresh</Text>
//         </Button>
//       </View>
//     );
//   }
//   return (
//     <ScrollView className="h-3/4 w-full">
//       {status === 'scanning' && <ScanningLoading />}
//       <View className="w-full flex-col gap-2">
//         {detectedSmartPots.map((pot, index) => {
//           return <PotDevice pot={pot} key={index} />;
//         })}
//       </View>
//     </ScrollView>
//   );
// };

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
