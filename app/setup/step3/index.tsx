import PotDevice from '@/components/custom/pot-device';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import useBluetoothLE from '@/hooks/useBluetoothLE';
import { RelativePathString, Stack, useRouter } from 'expo-router';
import { Loader, RefreshCcw } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, RefreshControl, ScrollView, View } from 'react-native';
import { Device } from 'react-native-ble-plx';

const Step3 = () => {
  const router = useRouter();
  const { width: screenWidth } = Dimensions.get('window');
  const { connectionStatus, detectedSmartPots } = useBluetoothLE();

  // Lowkey, to lazy to remove this. It doesnt do anything but i might use it later, idk
  async function onConnect(device: Device): Promise<boolean> {
    return true;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
          animation: 'fade',
          animationDuration: 100,
        }}
      />
      <View className="mt-full relative h-full px-8">
        <View className="mt-12 gap-4">
          <Text className="text-nowrap text-6xl">Step 3</Text>
          <Text className="text-lg text-muted-foreground">Scanning for devices.</Text>
        </View>
        <DevicePairing badBTRedirectHref="/setup/bt-request" onConnect={onConnect} />
        <View className="w-full flex-row gap-4">
          <Button
            size={'lg'}
            style={{
              width: screenWidth / 2 - 40,
            }}
            variant={'secondary'}
            onPress={() => {
              router.replace('/setup/step2');
            }}>
            <Text>Back</Text>
          </Button>
          <Button
            style={{
              width: screenWidth / 2 - 40,
            }}
            disabled={connectionStatus != 'Connected'}
            size={'lg'}
            onPress={() => {
              router.push('/setup/step4');
            }}>
            <Text>Next</Text>
          </Button>
        </View>
      </View>
    </>
  );
};

export default Step3;

const DevicePairing = ({
  badBTRedirectHref,
  onConnect,
}: {
  badBTRedirectHref: string;
  onConnect: (dev: Device) => Promise<boolean>;
}) => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { bleManager, init, stopDeviceScan, status, detectedSmartPots } = useBluetoothLE();
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    init();
    return () => {
      stopDeviceScan();
    };
  }, []);

  useEffect(() => {
    async function checkBluetoothState() {
      if ((await bleManager.state()) !== 'PoweredOn') {
        stopDeviceScan();
        router.replace(badBTRedirectHref as RelativePathString);
      }
    }

    bleManager.onStateChange((newState) => {
      if (newState !== 'PoweredOn') {
        stopDeviceScan();
        router.replace(badBTRedirectHref as RelativePathString);
      }
    });

    checkBluetoothState();
  }, []);

  return (
    <View className="w-full flex-1 items-center justify-center">
      {status == 'scanning' && detectedSmartPots.length == 0 ? (
        <View className="h-full w-full items-center justify-center">
          <View className="animate-spin">
            <Loader color="black" />
          </View>
        </View>
      ) : null}
      {detectedSmartPots.length == 0 && status != 'scanning' ? (
        <View className="h-full w-full items-center justify-center">
          <View className="w-full items-center justify-center gap-4">
            <Image
              source={require('@/assets/images/undraw_images_v4j9.png')}
              onError={(e) => console.error('Image failed to load:', e.nativeEvent.error)}
              onLoad={() => console.log('Image loaded successfully!')}
              style={{
                resizeMode: 'contain',
                height: 200,
              }}
            />
          </View>
          <View className="gap-12">
            <Text className="text-black">
              Hmm. No devices could be located. Check that your pot is plugged in.
            </Text>
            <Button size={'lg'} onPress={() => init()}>
              <RefreshCcw color={colorScheme === 'dark' ? 'black' : 'white'} />
              <Text>Scan Again</Text>
            </Button>
          </View>
        </View>
      ) : null}
      {detectedSmartPots.length >= 1 ? (
        <ScrollView
          className="my-8 w-full"
          refreshControl={<RefreshControl refreshing={status === 'scanning'} onRefresh={init} />}>
          {detectedSmartPots.map((device, index) => {
            return <PotDevice pot={device} key={index} onConnect={onConnect} />;
          })}
        </ScrollView>
      ) : null}
    </View>
  );
};
