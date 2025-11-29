import SettingsForm from '@/components/custom/settings';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import useBluetoothLE from '@/hooks/useBluetoothLE';
import { ILocalStoragePlantRecord, ISyncPlant, NotificationAddDevice, SaveData } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { Loader2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Subscription, BleError, Characteristic } from 'react-native-ble-plx';
import { Toast } from 'toastify-react-native';

const SettingsPage = () => {
  const params = useLocalSearchParams();
  const { colorScheme } = useColorScheme();

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
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const [initialValues, setInitalValues] = useState<SaveData>({
    deviceName: 'SMARTPot',
    measurementSystem: 0,
    selectedPlant: 'Generic',
  });

  const sendDataToSmartPot = async (saveData: SaveData): Promise<boolean> => {
    try {
      // make sure bluetooth is on
      if ((await bleManager.state()) !== 'PoweredOn') {
        return false;
      }

      if (!connectedDevice) router.replace('/');

      // get the data from previous step.
      const name = saveData.deviceName;
      const plant = saveData.selectedPlant;
      const measurementSystem = saveData.measurementSystem;

      // save as object (it will be stringifed in b64 encoded)
      const data: ISyncPlant = {
        deviceName: name as string,
        plant: plant as string,
        mes_sys: parseInt(measurementSystem as unknown as string),
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
        measurementSystem: parseInt(measurementSystem as unknown as string),
        plant,
      } as ILocalStoragePlantRecord;

      const plantsJson = await AsyncStorage.getItem('plants');
      let currentPlants: Record<string, ILocalStoragePlantRecord> = {};

      if (plantsJson) {
        currentPlants = JSON.parse(plantsJson);
      }

      currentPlants[newDevice.id] = newDevice;

      await AsyncStorage.setItem('plants', JSON.stringify(currentPlants));
      Toast.success('Update Successful!');
      return true;
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : new Error(String(error)).message);
      return false;
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

  async function onSave(data: SaveData) {
    setButtonLoading(true);
    const success = await sendDataToSmartPot(data);
    if (!success) {
      router.replace('/');
    }
    setButtonLoading(false);
  }

  async function factoryReset() {
    setButtonLoading(true);
    const success = await sendDataToSmartPot({
      deviceName: 'SMARTPot',
      measurementSystem: 0,
      selectedPlant: 'Generic',
    });
    if (!success) {
      router.replace('/');
    }
    setButtonLoading(false);
  }

  async function removeDevice() {
    setButtonLoading(true);
    const success = await sendDataToSmartPot({
      deviceName: 'SMARTPot',
      measurementSystem: 0,
      selectedPlant: 'Generic',
    });

    if (!success) {
      router.replace('/');
    }

    const storage = await AsyncStorage.getItem('plants');

    let existing: Record<string, ILocalStoragePlantRecord> = {};

    if (!storage) {
      router.replace('/');

      setButtonLoading(false);
      return;
    }

    existing = JSON.parse(storage);

    let updated: Record<string, ILocalStoragePlantRecord> = Object.keys(existing).reduce(
      (acc: Record<string, ILocalStoragePlantRecord>, key: string) => {
        if (key !== params['localId']) {
          acc[key] = existing[key];
        }
        return acc;
      },
      {}
    );

    await AsyncStorage.setItem('plants', JSON.stringify(updated));

    setButtonLoading(false);
    router.replace('/');
  }

  useEffect(() => {
    async function initialize() {
      const data = await AsyncStorage.getItem('plants');
      let existingDevices: Record<string, ILocalStoragePlantRecord> = {};

      if (!data) {
        setLoading(false);
        router.replace('/');
        return;
      }

      existingDevices = JSON.parse(data);

      const val = existingDevices[params['localId'] as string] as ILocalStoragePlantRecord;
      console.log(params['localId']);
      if (!val) {
        setLoading(false);
        router.replace('/');
      }
      console.log(val);

      setInitalValues({
        deviceName: val.name,
        measurementSystem: val.measurementSystem,
        selectedPlant: val.plant,
      });
      setLoading(false);
    }
    initialize();
  }, []);

  if (loading) {
    return (
      <View className="h-full w-full items-center justify-center">
        <View></View>
        <View className="w-full animate-spin items-center justify-center duration-1000">
          <Loader2 color={colorScheme === 'dark' ? 'white' : 'black'} />
        </View>
      </View>
    );
  }
  return (
    <View className="h-full w-full p-4">
      <SettingsForm onSave={onSave} defaultValues={initialValues}>
        <View className="w-full gap-4">
          <Button onPress={factoryReset} disabled={buttonLoading} variant={'destructive'}>
            <Text>Factory Reset</Text>
          </Button>
          <Button onPress={removeDevice} disabled={buttonLoading} variant={'destructive'}>
            <Text>Remove Device</Text>
          </Button>
        </View>
      </SettingsForm>
    </View>
  );
};

export default SettingsPage;
