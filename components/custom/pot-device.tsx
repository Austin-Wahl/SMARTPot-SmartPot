import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import useBluetoothLE from '@/hooks/useBluetoothLE';
import { router } from 'expo-router';
import { Loader2, Plug, Unplug } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Device } from 'react-native-ble-plx';

const PotDevice = ({
  pot,
  onConnect: onDeviceCB,
}: {
  pot: Device;
  onConnect: (dev: Device) => Promise<boolean>;
}) => {
  const { colorScheme } = useColorScheme();
  const { disconnect, connect, connectionStatus } = useBluetoothLE();

  function onDisconnectPress() {
    disconnect(pot);
  }

  async function connectToPot() {
    await connect(pot.id, onConnect);
  }

  function onConnect(device: Device) {
    onDeviceCB(device);
  }

  return (
    <View className="flex flex-row items-center justify-between gap-4 rounded-lg border-[1px] border-border p-4">
      <View>
        <Text>{pot.name}</Text>
        <Badge
          className={
            connectionStatus != 'Disconnected'
              ? connectionStatus == 'Error'
                ? 'bg-red-500'
                : 'bg-green-500'
              : 'bg-amber-500'
          }>
          <Text>{connectionStatus}</Text>
        </Badge>
      </View>
      <View>
        {connectionStatus == 'Connected' || connectionStatus == 'Disconnecting' ? (
          <Button onPress={onDisconnectPress} disabled={connectionStatus == 'Disconnecting'}>
            {connectionStatus == 'Disconnecting' ? (
              <View className="animate-spin duration-1000">
                <Loader2 color={colorScheme === 'dark' ? 'black' : 'white'} />
              </View>
            ) : (
              <Unplug color={colorScheme === 'dark' ? 'black' : 'white'} />
            )}
            <Text>Disconnect</Text>
          </Button>
        ) : (
          <Button onPress={connectToPot} disabled={connectionStatus == 'Connecting'}>
            {connectionStatus == 'Connecting' ? (
              <View className="animate-spin duration-1000">
                <Loader2 color={colorScheme === 'dark' ? 'black' : 'white'} />
              </View>
            ) : (
              <Plug color={colorScheme === 'dark' ? 'black' : 'white'} />
            )}
            <Text>Connect</Text>
          </Button>
        )}
      </View>
    </View>
  );
};

export default PotDevice;
