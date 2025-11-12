// app/add-device.tsx
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { View, Text, Button as RNButton } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddDeviceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Useful for padding content within the modal

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add New SmartPot', // Title for the header of the modal screen
          // presentation: 'modal', // <--- THIS IS THE KEY!
          // You might want to customize the header for a modal:
          headerLeft: () => (
            // Often you'll put a "Close" or "Cancel" button here
            <RNButton onPress={() => router.back()} title="Cancel" />
          ),
          headerRight: () => (
            // Or a "Done" button
            <RNButton
              onPress={() => {
                /* save logic here */ router.back();
              }}
              title="Done"
            />
          ),
          // Optionally, make the header transparent if your modal content handles its own top styling
          // headerTransparent: true,
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: 'white', // Ensure your modal has a background color
          paddingTop: insets.top, // Use safe area for content
          paddingBottom: insets.bottom,
          paddingHorizontal: 20,
        }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          Configure Your New SmartPot
        </Text>
        <Text>This is where your input fields and setup steps would go.</Text>
        {/* Your actual form/setup content */}
        <RNButton
          title="Finish Setup"
          onPress={() => {
            /* ... navigate to sync or whatever ... */
          }}
        />
      </View>
    </>
  );
}
