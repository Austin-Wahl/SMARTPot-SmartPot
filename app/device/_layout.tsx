import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Text } from '@/components/ui/text';
import useBluetoothLE from '@/hooks/useBluetoothLE';
import { Slot, useNavigation } from 'expo-router';
import { AlertCircleIcon, Loader2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View } from 'react-native';

const DeviceLayout = () => {
  const { reconnect, connectedDevice, onConnectionDropped, connectionStatus } = useBluetoothLE();
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const [reconnectSuccess, setReconnectSuccess] = useState(true);

  useEffect(() => {
    const unsub = onConnectionDropped(async (device) => {
      if (!device) return;
      const conStat = await reconnect(device.id);
      setReconnectSuccess(conStat);
    });

    return () => {
      unsub();
    };
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: connectedDevice?.name ?? 'Device',
    });
  }, [connectedDevice, navigation]);

  return (
    <View className="flex-1 p-4">
      {connectionStatus === 'Disconnected' || connectionStatus === 'Connecting' ? (
        <View className="w-full gap-4">
          <Alert icon={AlertCircleIcon} variant="destructive">
            <AlertTitle>
              <Text>{connectedDevice?.name} Disconnected</Text>
            </AlertTitle>
            <AlertDescription>
              <Text>The connection was lost.</Text>
            </AlertDescription>
          </Alert>
          {!reconnectSuccess && (
            <View className="flex w-full items-center justify-center gap-2">
              <View className="w-full items-center">
                <Text>Failed to reconnect</Text>
              </View>
            </View>
          )}
          {reconnectSuccess && (
            <View className="flex w-full items-center justify-center gap-2">
              <View className="w-full items-center">
                <Text>Reconnecting...</Text>
              </View>
              <View className="w-full animate-spin items-center justify-center duration-1000">
                <Loader2 color={colorScheme === 'dark' ? 'white' : 'black'} />
              </View>
            </View>
          )}
        </View>
      ) : (
        <Slot />
      )}
    </View>
  );
};

export default DeviceLayout;
