import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Image, View } from 'react-native';

const GettingStartedPage = () => {
  const router = useRouter();
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
          <Text className="text-nowrap text-6xl">SMARTPot</Text>
          <Text className="text-lg text-muted-foreground">
            Setting up your SMARTPot is easy. No Account. No WiFi. Just connect, configure, and
            forget.
          </Text>
        </View>
        <View className="w-full flex-1 items-center justify-center">
          <Image
            source={require('@/assets/images/svg-ai-generate-a-colorful-potted-house-plant-keep-it-sim-2025-11-07.png')}
            // style={styles.image}
            onError={(e) => console.error('Image failed to load:', e.nativeEvent.error)}
            onLoad={() => console.log('Image loaded successfully!')}
            className="w-full"
            style={{
              resizeMode: 'contain',
            }}
          />
        </View>
        <Button
          size={'lg'}
          onPress={() => {
            router.push('/setup/step1');
          }}>
          <Text>Get Started</Text>
        </Button>
      </View>
    </>
  );
};

export default GettingStartedPage;
