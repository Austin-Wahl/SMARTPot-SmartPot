import plants from '@/assets/dat/plants.json';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { TriggerRef } from '@rn-primitives/dropdown-menu';
import { Option } from '@rn-primitives/select';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mesSys: Record<number, string> = { 0: 'Ferinehight', 1: 'Celsius' };

const Step4 = () => {
  const router = useRouter();
  const { width: screenWidth } = Dimensions.get('window');
  const ref = React.useRef<TriggerRef>(null);
  const insets = useSafeAreaInsets();

  const [deviceName, setDeviceName] = useState<string>('SMARTPot');
  const [selectedPlant, setSelectedPlant] = useState<string>('Generic');
  const [measurementSystem, setMeasurementSystem] = useState<0 | 1>(0);

  const [deviceNameError, setDeviceNameError] = useState<null | string>(null);

  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({ ios: insets.bottom, android: insets.bottom + 24 }),
    left: 12,
    right: 12,
  };

  const handlePlantNameInput = (event: string) => {
    if (event.trim().length > 20) {
      setDeviceNameError('Device name is to long.');
    } else if (event.length <= 0) {
      setDeviceNameError('Device name is required.');
    } else setDeviceNameError(null);

    setDeviceName(event);
  };

  const handlePlantSelection = (selection: Option) => {
    setSelectedPlant(selection!.value);
  };

  const handleMeasurementSelection = (selection: Option) => {
    setMeasurementSystem(selection!.value as unknown as 0 | 1);
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
          <Text className="text-nowrap text-6xl">Almost There!</Text>
          <Text className="text-lg text-muted-foreground">
            Before you finish up, your SMARTPot can be customized. Consider selecting a preset plant
            and giving your Pot a name!
          </Text>
        </View>
        <ScrollView
          className="my-12 w-full flex-1"
          contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <View className="w-full border-border pb-4 odd:border-b-[1px]">
            <Text className="pb-2 text-lg">SMARTPot Name</Text>
            <Input
              placeholder="SMARTPot Name"
              onChangeText={handlePlantNameInput}
              value={deviceName}
            />
            <Text className="pt-2 text-sm text-muted-foreground">
              By default, all SMARTPots share the same name. You can give it a custom one to make it
              easier to identify. It can always be changed later.
            </Text>
            {deviceNameError && (
              <Text className="pt-2 text-sm text-red-300">{deviceNameError}</Text>
            )}
          </View>
          <View className="w-full border-border pb-4 odd:border-b-[1px]">
            <Text className="pb-2 text-lg">Plant</Text>
            <Select
              onValueChange={handlePlantSelection}
              value={{
                label: selectedPlant as string,
                value: selectedPlant as string,
              }}>
              <SelectTrigger ref={ref} className="">
                <SelectValue placeholder="Select a plant" />
              </SelectTrigger>
              <SelectContent className="w-[180px]" insets={insets}>
                <SelectGroup>
                  <SelectLabel>Plants</SelectLabel>
                  {Object.keys(plants).map((plant, index) => (
                    <SelectItem key={index} label={plant} value={plant}>
                      {plant}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Text className="pt-2 text-sm text-muted-foreground">
              SMARTPots use thresholds to calculate the Health Score so it's import you select the
              right plant. If you don't see your plant listed, choose Generic. You can always change
              this later.
            </Text>
          </View>
          <View className="w-full border-border pb-4 odd:border-b-[1px]">
            <Text className="pb-2 text-lg">Unit of Measurement</Text>
            <Select
              onValueChange={handleMeasurementSelection}
              value={{
                label: mesSys[measurementSystem as unknown as number],
                value: mesSys.toString(),
              }}>
              <SelectTrigger ref={ref} className="">
                <SelectValue placeholder="Unit of Measurement" />
              </SelectTrigger>
              <SelectContent className="w-[180px]" insets={insets}>
                <SelectGroup>
                  <SelectLabel>Unit of Measurement</SelectLabel>
                  {Object.keys(mesSys).map((mes, index) => (
                    <SelectItem
                      key={index}
                      label={mesSys[mes as unknown as number]}
                      value={mes.toString()}>
                      {mesSys[mes as unknown as number]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Text className="pt-2 text-sm text-muted-foreground">
              Select your prefered unit of measurement.
            </Text>
          </View>
        </ScrollView>
        <View className="w-full flex-row gap-4">
          <Button
            size={'lg'}
            style={{
              width: screenWidth / 2 - 40,
            }}
            variant={'secondary'}
            onPress={() => {
              router.replace('/setup/step3');
            }}>
            <Text>Back</Text>
          </Button>
          <Button
            style={{
              width: screenWidth / 2 - 40,
            }}
            disabled={deviceNameError !== null}
            size={'lg'}
            onPress={() => {
              router.push({
                pathname: '/setup/sync',
                params: {
                  deviceName: deviceName.trim(),
                  plant: selectedPlant,
                  measurementSystem: measurementSystem,
                },
              });
            }}>
            <Text>Finish</Text>
          </Button>
        </View>
      </View>
    </>
  );
};

export default Step4;
