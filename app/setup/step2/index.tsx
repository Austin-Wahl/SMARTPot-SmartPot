import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import useBluetoothLE from '@/hooks/useBluetoothLE';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircleIcon, Bluetooth } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, View } from 'react-native';

const Step2 = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { width: screenWidth } = Dimensions.get('window');
  const [btStatus, setBtStatus] = useState<string | null>(null);

  useEffect(() => {
    if (Object.keys(params).length > 0) {
      setBtStatus(params['bluetoothError'] as string);
    }
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
      <View className="mt-full relative mx-8 h-full">
        <View className="mt-12 gap-4">
          <Text className="text-nowrap text-6xl">Step 2</Text>
          <Text className="text-lg text-muted-foreground">
            Ensure Bluetooth is enabled on your phone. You will be prompted to allow Bluetooth
            permissions for this app. Press accept/allow.
          </Text>
        </View>
        {btStatus != null ? (
          <View className="mt-8">
            <Alert icon={AlertCircleIcon} variant="destructive">
              <AlertTitle>
                <Text>There was an issue.</Text>
              </AlertTitle>
              <AlertDescription>
                <Text>{btStatus}</Text>
              </AlertDescription>
            </Alert>
          </View>
        ) : null}
        <View className="w-full flex-1 items-center justify-center">
          <Bluetooth size={200} color={'black'} />
        </View>
        <View className="w-full flex-row gap-4">
          <Button
            size={'lg'}
            style={{
              width: screenWidth / 2 - 40,
            }}
            variant={'secondary'}
            onPress={() => {
              router.replace('/setup/step1');
            }}>
            <Text>Back</Text>
          </Button>
          <Button
            style={{
              width: screenWidth / 2 - 40,
            }}
            size={'lg'}
            onPress={() => {
              router.push('/setup/bt-request');
            }}>
            <Text>Next</Text>
          </Button>
        </View>
      </View>
    </>
  );
};

export default Step2;
