import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import { Plug } from 'lucide-react-native';
import React from 'react';
import { Dimensions, View } from 'react-native';

const Step1 = () => {
  const router = useRouter();
  const { width: screenWidth } = Dimensions.get('window');

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
          <Text className="text-nowrap text-6xl">Step 1</Text>
          <Text className="text-lg text-muted-foreground">
            Make sure your SMARTPot is plugged in to the wall using the provided USB-C cable.
          </Text>
        </View>
        <View className="w-full flex-1 items-center justify-center">
          <Plug size={200} color={'black'} />
        </View>
        <View className="w-full flex-row gap-4">
          <Button
            size={'lg'}
            style={{
              width: screenWidth / 2 - 40,
            }}
            variant={'secondary'}
            onPress={() => {
              router.replace('/setup');
            }}>
            <Text>Back</Text>
          </Button>
          <Button
            style={{
              width: screenWidth / 2 - 40,
            }}
            size={'lg'}
            onPress={() => {
              router.push('/setup/step2');
            }}>
            <Text>Next</Text>
          </Button>
        </View>
      </View>
    </>
  );
};

export default Step1;
