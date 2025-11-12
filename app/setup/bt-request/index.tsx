import useBluetoothLE from '@/hooks/useBluetoothLE';
import { Stack, useRouter } from 'expo-router';
import { Loader } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { View } from 'react-native';

const Step2 = () => {
  const router = useRouter();
  const { requestPermissions, bleManager } = useBluetoothLE();

  useEffect(() => {
    async function btStatus() {
      const res = await requestPermissions();
      if (!res)
        return router.replace({
          pathname: '/setup/step2',
          params: {
            bluetoothError: 'There is an unknown error.',
          },
        });
      const status = await bleManager.state();

      if (status !== 'PoweredOn') {
        let error = 'Bluetooth is not turned on.';
        if (status == 'PoweredOff') {
          error = 'Bluetooth is not turned on.';
        } else if (status == 'Unauthorized') {
          error =
            "Bluetooth permissions are not enabled. Please go to your settings and manually allow Bluetooth permissions for 'SMARTPot'.";
        } else {
          error = 'There is an unknown error. Bluetooth state is: ' + status;
        }
        router.replace({
          pathname: '/setup/step2',
          params: {
            bluetoothError: error,
          },
        });
      } else {
        router.push('/setup/step3');
      }
    }
    btStatus();
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
      <View className="h-full w-full items-center justify-center">
        <View className="animate-spin">
          <Loader />
        </View>
      </View>
    </>
  );
};

export default Step2;
