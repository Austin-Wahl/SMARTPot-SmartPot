import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useEffect } from 'react';

const Layout = () => {
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme('light');
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="/setup/" />
      </Stack>
    </>
  );
};

export default Layout;
