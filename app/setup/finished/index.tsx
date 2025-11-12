import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import { Plug } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Image, Linking, ScrollView, View } from 'react-native';

const Finished = () => {
  const router = useRouter();
  const { width: screenWidth } = Dimensions.get('window');

  const openExternalLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log(`Don't know how to open URI: ${url}`);
      }
    } catch (error) {
      console.error('An error occurred while opening the URL:', error);
    }
  };

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
          <Text className="text-nowrap text-6xl">Congrats!</Text>
          <Text className="text-lg text-muted-foreground">Your SMARTPot is all setup!</Text>
        </View>
        <View className="my-12 w-full flex-1 justify-center">
          <Text className="text-sm text-muted-foreground">Did you know?</Text>
          <ScrollView className="w-full gap-2">
            <View className="w-full flex-row items-center gap-4 border-b-[1px] border-border">
              <View className="h-[100px] w-[100px]">
                <Image
                  source={require('@/assets/images/undraw_profile-data_xkr9.png')}
                  className="h-[100px] w-[100px]"
                  style={{
                    resizeMode: 'contain',
                  }}
                />
              </View>
              <View className="flex-1">
                <Text className="font-bold">View Data in the App</Text>
                <Text className="text-sm text-muted-foreground">
                  You can connect to your SMARTPot over bluetooth to view the data all within the
                  app!
                </Text>
              </View>
            </View>
            <View className="w-full flex-row items-center gap-4 border-b-[1px] border-border">
              <View className="h-[100px] w-[100px]">
                <Image
                  source={require('@/assets/images/undraw_weather-app_4cp0.png')}
                  className="h-[100px] w-[100px]"
                  style={{
                    resizeMode: 'contain',
                  }}
                />
              </View>
              <View className="flex-1">
                <Text className="font-bold">Manually Water</Text>
                <Text className="text-sm text-muted-foreground">
                  You can manually trigger watering! Just set a timer and your SMARTPot will water
                  your plant.
                </Text>
              </View>
            </View>
            <View className="w-full flex-row items-center gap-4 border-b-[1px] border-border">
              <View className="h-[100px] w-[100px]">
                <Image
                  source={require('@/assets/images/undraw_open-source_g069.png')}
                  className="h-[100px] w-[100px]"
                  style={{
                    resizeMode: 'contain',
                  }}
                />
              </View>
              <View className="flex-1">
                <Text className="font-bold">Open Source</Text>
                <Text className="text-sm text-muted-foreground">
                  SMARTPot is an open source project! You can view the project{' '}
                  <Text
                    onPress={() => openExternalLink('https://github.com/Austin-Wahl')}
                    className="text-purple-500">
                    here!
                  </Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
        <View className="w-full flex-row gap-4">
          <Button
            className="w-full"
            size={'lg'}
            onPress={() => {
              router.push('/');
            }}>
            <Text>Home</Text>
          </Button>
        </View>
      </View>
    </>
  );
};

export default Finished;
