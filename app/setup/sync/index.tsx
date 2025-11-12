import { Text } from '@/components/ui/text';
import useBluetoothLE from '@/hooks/useBluetoothLE';
import { ILocalStoragePlantRecord, ISyncPlant, NotificationAddDevice } from '@/types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Loader } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, View } from 'react-native';
import { BleError, Characteristic, Subscription } from 'react-native-ble-plx';
import { Toast } from 'toastify-react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

const SyncScreen = () => {
  const router = useRouter();
  const { width: screenWidth } = Dimensions.get('window');
  const params = useLocalSearchParams();
  const {
    bleManager,
    CHARACTERISTIC_MAP,
    connectedDevice,
    SERVICE_UUID,
    onConnectionDropped,
    reconnect,
  } = useBluetoothLE();
  const [reconnectionStatus, setReconnectionStatus] = useState<null | string>();
  const notificationSubscription = useRef<null | Subscription>(null);

  const sendDataToSmartPot = async () => {
    try {
      // make sure bluetooth is on
      if ((await bleManager.state()) !== 'PoweredOn') {
        router.replace('/setup/step2');
      }

      if (!connectedDevice) router.replace('/setup/step2');

      // get the data from previous step.
      const name = params['deviceName'];
      const plant = params['plant'];
      const measurementSystem = params['measurementSystem'];

      // save as object (it will be stringifed in b64 encoded)
      const data: ISyncPlant = {
        deviceName: name as string,
        plant: plant as string,
        mes_sys: parseInt(measurementSystem as string),
      };

      // get the pots characteristics
      const characteristics = await connectedDevice?.discoverAllServicesAndCharacteristics();

      // get the devices unique ID
      const id = await characteristics?.readCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_MAP['readId']
      );
      let idDecoded;
      if (!id?.value) {
        throw new Error('No ID found. Please restart your pot and restart the setup process.');
      }
      idDecoded = atob(id.value);

      // Configure the monitor
      const err = await configureMonitor();

      if (err) throw err;
      // write the data
      await characteristics?.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        CHARACTERISTIC_MAP['sendConfig'],
        btoa(JSON.stringify(data))
      );

      const newDevice = {
        id: idDecoded,
        name,
        addedAt: Date.now(),
        measurementSystem: parseInt(measurementSystem as string),
        plant,
      } as ILocalStoragePlantRecord;

      const plantsJson = await AsyncStorage.getItem('plants');
      let currentPlants: Record<string, ILocalStoragePlantRecord> = {};

      if (plantsJson) {
        currentPlants = JSON.parse(plantsJson);
      }

      currentPlants[newDevice.id] = newDevice;

      await AsyncStorage.setItem('plants', JSON.stringify(currentPlants));

      router.replace('/setup/finished');
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : new Error(String(error)).message);
    }
  };

  const configureMonitor = async (): Promise<Error | null> => {
    if (!connectedDevice) return new Error('No Device Connected');

    if (notificationSubscription.current) {
      notificationSubscription.current.remove();
      notificationSubscription.current = null;
    }

    notificationSubscription.current = await bleManager.monitorCharacteristicForDevice(
      connectedDevice.id,
      SERVICE_UUID,
      CHARACTERISTIC_MAP['notification'],
      (error: BleError | null, characteristic: Characteristic | null) => {
        if (error) return error;

        if (characteristic?.value) {
          const decoded = JSON.parse(
            atob(characteristic.value)
          ) as unknown as NotificationAddDevice;
          if (!decoded.success) {
            return new Error('The SMARTPot failed to parse data correctly and returned an error.');
          }
        } else {
          return new Error('No response recieved');
        }
      }
    );
    return null;
  };

  useEffect(() => {
    sendDataToSmartPot();

    function clean() {
      if (notificationSubscription.current) {
        notificationSubscription.current.remove();
      }
    }
    return () => clean();
  }, [connectedDevice]);

  useEffect(() => {
    async function checkBluetoothState() {
      if ((await bleManager.state()) !== 'PoweredOn') {
        router.replace('/setup/bt-request');
      }
    }

    bleManager.onStateChange((newState) => {
      if (newState !== 'PoweredOn') {
        router.replace('/setup/bt-request');
      }
    });

    onConnectionDropped(async (device) => {
      setReconnectionStatus('Connection Lost. Attempting to reconnect...');
      let i = 0;
      while (i < 2) {
        const con = await reconnect(device!.id);
        if (con) {
          setReconnectionStatus(null);
          await sendDataToSmartPot();
          return;
        }
      }
      router.replace('/setup/step2');
    });

    checkBluetoothState();
  }, []);

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
          <Text className="text-nowrap text-6xl">Syncing With your Pot!</Text>
          <Text className="text-lg text-muted-foreground">
            Please allow for your SMARTPot to update with your configuration. Do not disconnect it
            during this process. You will be redirected automatically!
          </Text>
        </View>
        <View className="w-full items-center justify-center gap-4">
          <Image
            source={require('@/assets/images/undraw_os-upgrade_ztrf.png')}
            onError={(e) => console.error('Image failed to load:', e.nativeEvent.error)}
            onLoad={() => console.log('Image loaded successfully!')}
            style={{
              resizeMode: 'contain',
              height: 400,
            }}
          />
        </View>
        <View className="w-full flex-1 items-center justify-center gap-12">
          <View className="h-full w-full items-center justify-center">
            <View className="animate-spin">
              <Loader color="black" />
            </View>
            {reconnectionStatus && <Text>{reconnectionStatus}</Text>}
          </View>
        </View>
      </View>
    </>
  );
};

export default SyncScreen;
