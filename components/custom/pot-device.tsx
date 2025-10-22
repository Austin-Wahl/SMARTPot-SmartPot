import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import useBluetoothLE from '@/hooks/useBluetoothLE';
import { Loader2, Plug } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Device } from 'react-native-ble-plx';
import { Toast } from 'toastify-react-native';

const PotDevice = ({ pot }: { pot: Device }) => {
  const { colorScheme } = useColorScheme();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisonnecting] = useState(false);
  const { bleManager, disconnect } = useBluetoothLE();
  const [device, setDevice] = useState<Device | null>(null);

  function onDisconnect() {
    setConnected(false);
    setDisonnecting(false);
    setDevice(null);
  }

  function onDisconnectPress() {
    setDisonnecting(true);
    disconnect(pot);
  }

  useEffect(() => {
    const listner = bleManager.onDeviceDisconnected(pot.id, onDisconnect);

    return () => {
      listner.remove();
    };
  }, []);

  async function connectToPot() {
    setConnecting(true);
    try {
      const device = await bleManager.connectToDevice(pot.id, { timeout: 5000 });
      setDevice(device);
      setConnected(await device.isConnected());
    } catch (error) {
      setConnected(false);
      Toast.error(error instanceof Error ? error.message : new Error(String(error)).message);
    } finally {
      setConnecting(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    setConnecting(true);
    async function getConnectionStatus() {
      try {
        const connectedDevices = await bleManager.connectedDevices([
          '6360ec7b-a2b6-41d2-87c6-be45caf92838',
        ]);

        const dev = connectedDevices.find((device) => device.id === pot.id);
        if (dev && isMounted) {
          const connection = await dev.isConnected();
          setConnected(connection);
          setDevice(pot);
          console.log('connectd 1');
        }
      } catch (error) {
        console.error('Error checking connection status:', error);
        Toast.error(error instanceof Error ? error.message : new Error(String(error)).message);
      } finally {
        if (isMounted) {
          setConnecting(false);
        }
      }
    }

    getConnectionStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View className="flex flex-row items-center justify-between gap-4 rounded-lg border-[1px] border-border p-4">
        <View className="gap-2">
          <Skeleton className="h-[20px] w-[100px]" />
          <Skeleton className="h-[20px] w-[60px]" />
        </View>
        <View>
          <Skeleton className="h-[40px] w-[100px]" />
        </View>
      </View>
    );
  }
  return (
    <View className="flex flex-row items-center justify-between gap-4 rounded-lg border-[1px] border-border p-4">
      <View>
        <Text>{pot.name}</Text>
        <Badge className={connected ? 'bg-green-500' : 'bg-amber-500'}>
          <Text>{connected ? 'Connected' : 'Not Connected'}</Text>
        </Badge>
      </View>
      <View>
        {connected ? (
          <Button onPress={onDisconnectPress} disabled={disconnecting}>
            <Text>Disconnect</Text>
          </Button>
        ) : (
          <Button onPress={connectToPot} disabled={connecting}>
            {connecting ? (
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
