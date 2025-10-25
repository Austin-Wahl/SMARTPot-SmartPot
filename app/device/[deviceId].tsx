import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import useBluetoothLE from '@/hooks/useBluetoothLE';
import { router, useLocalSearchParams } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { View } from 'react-native';

const DevicePage = () => {
  const { connectedDevice, bleManager, SERVICE_UUID, CHARACTERISTIC_MAP } = useBluetoothLE();
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();

  //   useEffect(() => {
  //     async function getCharacteristic() {
  //       //   const characteristic = await bleManager.readCharacteristicForDevice(
  //       //     deviceId,
  //       //     SERVICE_UUID,
  //       //     CHARACTERISTIC_MAP['read-humidity']
  //       //   );
  //       //   const humidity = characteristic.read();

  //       //   console.log({ humidity });
  //       const characteristics = await connectedDevice?.characteristicsForService(SERVICE_UUID);
  //       console.log(characteristics);
  //     }

  //     getCharacteristic();
  //   }, [connectedDevice]);

  if (!connectedDevice) {
    return (
      <View className="h-full w-full gap-4 p-4">
        <Alert icon={AlertCircle} variant="destructive">
          <AlertTitle>
            <Text>Device Not Connected</Text>
          </AlertTitle>
          <AlertDescription>
            <Text>The device you've connected to can't be reached.</Text>
          </AlertDescription>
        </Alert>
        <Button className="w-full" onPress={() => router.replace('/')}>
          <Text>Home</Text>
        </Button>
      </View>
    );
  }

  return (
    <>
      <Text>ID: {deviceId}</Text>
      <View className="relative"></View>
    </>
  );
};

export default DevicePage;
