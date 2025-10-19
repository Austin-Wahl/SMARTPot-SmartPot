import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import useBluetoothLE from '@/hooks/useBluetoothLE';
import { useFonts } from 'expo-font';
import { Link, SplashScreen, Stack } from 'expo-router';
import { ExtendedStackNavigationOptions } from 'expo-router/build/layouts/StackClient';
import { Cog, Flower, Moon, MoonStarIcon, StarIcon, Sun, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { type ImageStyle, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const SCREEN_OPTIONS: ExtendedStackNavigationOptions = {
  title: '',
  headerTransparent: true,
  headerRight: () => <SettingsMenu />,
};

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};

export default function Screen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [count, inc] = React.useState<number>(0);
  const [loaded, error] = useFonts({
    Quicksand: require('../assets/fonts/Quicksand/Quicksand-VariableFont_wght.ttf'),
  });
  const { requestPermissions } = useBluetoothLE();

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 items-center justify-center gap-8 p-4">
        {/* <Image source={LOGO[colorScheme ?? 'light']} style={IMAGE_STYLE} resizeMode="contain" /> */}
        <View className="flex items-center gap-4">
          <View className="flex h-[120px] w-[120px] items-center justify-center rounded-lg border-[1px] border-border">
            <Flower size={60} color="#22c55e" />
          </View>
          <Text>
            <Text className="font-extrabold" style={{ fontFamily: 'Quicksand' }}>
              SMART
            </Text>
            <Text className="text-quicksand text-green-500" style={{ fontFamily: 'Quicksand' }}>
              Pot
            </Text>
          </Text>
        </View>
        <View className="gap-2 p-4">
          <Text className="ios:text-foreground font-mono text-sm text-muted-foreground"></Text>
          <Text className="ios:text-foreground font-mono text-sm text-muted-foreground">
            {count}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Button
            onPressIn={requestPermissions}
            size="icon"
            variant="ghost"
            className="ios:size-9 rounded-full web:mx-4">
            <Text>Request Bluetooth Permissions</Text>
          </Button>
        </View>
      </View>
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function SettingsMenu() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="ios:size-9 rounded-full web:mx-4">
          <Cog color={colorScheme === 'dark' ? 'white' : 'black'} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        className="bg-card"
        style={{
          position: Platform.OS !== 'web' ? 'absolute' : undefined,
          top: Platform.OS !== 'web' ? insets.top + 60 : undefined,
        }}>
        <DropdownMenuLabel>
          <Text className="text-sm">Info</Text>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Text>Theme</Text>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onPressIn={() => {
                console.log('clicked');
                toggleColorScheme();
              }}>
              <Text>Dark</Text>
              <Moon />
            </DropdownMenuItem>
            <DropdownMenuItem onPressIn={toggleColorScheme}>
              <Text>Light</Text>
              <Sun />
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem asChild>
          <Link href="/team">
            <Text>Team</Text>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
