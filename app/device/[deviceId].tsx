import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import useBluetoothLE from '@/hooks/useBluetoothLE';
import {
  ILightSensorData,
  ISensorData,
  ISoilMoistureAndTemperatureSensorData,
  ITemperatureAndHumiditySensorData,
  TSoilMoistureLevels,
} from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import { AlertCircle, Cloud, DropletIcon, Sun, ThermometerIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Toast } from 'toastify-react-native';

const DevicePage = () => {
  const { connectedDevice, bleManager, SERVICE_UUID, CHARACTERISTIC_MAP } = useBluetoothLE();
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const [sensorData, setSensorData] = useState<Array<ISensorData>>([]);
  const [lastUpdated, setLastUpdated] = useState<number | null>();

  useEffect(() => {
    async function getCharacteristic() {
      try {
        const characteristics =
          await bleManager.discoverAllServicesAndCharacteristicsForDevice(deviceId);
        const chars = await characteristics.readCharacteristicForService(
          SERVICE_UUID,
          CHARACTERISTIC_MAP['read']
        );
        if (chars) {
          bleManager.monitorCharacteristicForDevice(
            deviceId,
            SERVICE_UUID,
            CHARACTERISTIC_MAP['read'],
            (error, characteristic) => {
              if (error) {
              }
              try {
                if (characteristic) {
                  if (characteristic.value) {
                    const data = atob(characteristic.value);
                    const jsonData = JSON.parse(data) as Array<ISensorData>;
                    setSensorData(jsonData);
                    setLastUpdated(Date.now());
                  }
                }
              } catch (error) {}
            }
          );
        }
      } catch (error) {
        Toast.error(error instanceof Error ? error.message : new Error(String(error)).message);
      }
    }

    getCharacteristic();
  }, [connectedDevice]);

  if (!connectedDevice) {
    return (
      <View className="h-full w-full gap-4 p-4">
        <Alert icon={AlertCircle} variant="destructive">
          <AlertTitle>
            <Text>Device Not Connected</Text>
          </AlertTitle>
          <AlertDescription>
            <Text>The device you've connected to can't be reached.</Text>
          </AlertDescription>
        </Alert>
        <Button className="w-full" onPress={() => router.replace('/')}>
          <Text>Home</Text>
        </Button>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 16,
          maxWidth: '100%',
        }}>
        {!sensorData || sensorData.length == 0 ? (
          <Text>Waiting for Sensor Data</Text>
        ) : (
          <View className="gap-4">
            <SensorCards sensorData={sensorData} />
            <Card>
              <CardContent>
                <CardTitle>Last Updated</CardTitle>
                <CardDescription>
                  {lastUpdated
                    ? new Date(lastUpdated).toLocaleDateString() +
                      ' @ ' +
                      new Date(lastUpdated).toLocaleTimeString()
                    : 'No Timestamp Available'}
                </CardDescription>
              </CardContent>
            </Card>
          </View>
        )}
      </ScrollView>
    </>
  );
};

const SensorCards = ({ sensorData: data }: { sensorData: Array<ISensorData> }) => {
  const [temp, setTemp] = useState<{ connected: boolean; value: number | null }>();
  const [humidity, setHumidity] = useState<{ connected: boolean; value: number | null }>();
  const [moisture, setMoisture] = useState<{ connected: boolean; value: number | null }>();
  const [light, setLight] = useState<{ connected: boolean; value: number | null }>();

  const parseData = () => {
    try {
      data.forEach((sensorDataRecord) => {
        const sensorName = sensorDataRecord.name;

        switch (sensorName) {
          case 'Humidity and Temperature':
            const { humidity, temperature } =
              sensorDataRecord.data as ITemperatureAndHumiditySensorData;
            if (humidity !== null && !isNaN(humidity))
              setHumidity({ connected: sensorDataRecord.connected, value: Math.ceil(humidity) });
            else {
              setHumidity({ connected: sensorDataRecord.connected, value: null });
            }
            if (temperature !== null && !isNaN(temperature))
              setTemp({ connected: sensorDataRecord.connected, value: Math.ceil(temperature) });
            else {
              setTemp({ connected: sensorDataRecord.connected, value: null });
            }
            break;
          case 'Light':
            const { light } = sensorDataRecord.data as ILightSensorData;
            if (light !== null && !isNaN(light)) {
              setLight({ connected: sensorDataRecord.connected, value: Math.ceil(light) });
            } else {
              setLight({ connected: sensorDataRecord.connected, value: null });
            }
            break;
          case 'Soil Moisture':
            const { moisture } = sensorDataRecord.data as ISoilMoistureAndTemperatureSensorData;
            if (moisture !== null && !isNaN(moisture)) {
              setMoisture({ connected: sensorDataRecord.connected, value: moisture });
            } else {
              setMoisture({ connected: sensorDataRecord.connected, value: null });
            }
            break;
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  function soilMoistureToString(rawMoisture: number): TSoilMoistureLevels {
    if (rawMoisture <= 200) return 'Very Dry';
    if (rawMoisture <= 700) return 'Dry';
    if (rawMoisture <= 1000) return 'Damp';
    if (rawMoisture <= 1300) return 'Wet';
    if (rawMoisture <= 1600) return 'Very Wet';
    return 'Saturated';
  }

  useEffect(() => {
    parseData();
  }, [data]);

  return (
    <View className="flex flex-row flex-wrap justify-between overflow-hidden rounded-lg border-[1px] border-border">
      <View className="h-[120px] w-1/2 flex-row gap-2 border-b-[1px] border-r-[1px] border-border p-4">
        <View>
          <ThermometerIcon color="orange" />
        </View>
        <View className="">
          <View>
            <Text className="text-sm text-muted-foreground">Temperature</Text>
          </View>
          <View className="flex-1 justify-center">
            <Text className="text-4xl">{temp?.connected ? `${temp.value}°F` : 'NC'}</Text>
          </View>
        </View>
      </View>
      <View className="h-[120px] w-1/2 flex-row gap-2 border-b-[1px] border-r-[1px] border-border p-4">
        <View>
          <Cloud color="lightblue" />
        </View>
        <View className="">
          <View>
            <Text className="text-sm text-muted-foreground">Humidity</Text>
          </View>
          <View className="flex-1 justify-center">
            <Text className="text-4xl">{humidity?.connected ? `${humidity.value}%` : 'NC'}</Text>
          </View>
        </View>
      </View>
      <View className="h-[120px] w-1/2 flex-row gap-2 border-b-[1px] border-r-[1px] border-border p-4">
        <View>
          <DropletIcon color="lightgreen" />
        </View>
        <View className="">
          <View>
            <Text className="text-sm text-muted-foreground">Soil Moisture</Text>
          </View>
          <View className="flex-1 justify-center">
            <Text className="text-4xl">
              {moisture?.connected && moisture.value ? soilMoistureToString(moisture.value) : 'NC'}
            </Text>
          </View>
        </View>
      </View>
      <View className="h-[120px] w-1/2 flex-row gap-2 border-b-[1px] border-r-[1px] border-border p-4">
        <View>
          <Sun color="yellow" />
        </View>
        <View className="">
          <View>
            <Text className="text-sm text-muted-foreground">Light (LUX)</Text>
          </View>
          <View className="w-full flex-1 justify-center">
            <Text className="text-4xl">
              {light?.connected && light.value !== null
                ? `${light.value >= 1000 ? (light.value / 1000).toFixed(2) + 'k' : light.value}`
                : 'NC'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default DevicePage;
