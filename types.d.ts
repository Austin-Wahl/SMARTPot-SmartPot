import { Device } from 'react-native-ble-plx';
import { BleManager } from 'react-native-ble-plx';
export interface ITeamMember {
  name: string;
  role: string;
  picture: string;
}

export type DeviceWithLastSeen = Device & { lastSeen: number };

export type TDeviceConnectionStatus =
  | 'Connecting'
  | 'Connected'
  | 'Error'
  | 'Disconnecting'
  | 'Disconnected';

export type TCharacteristics = 'read' | 'sendConfig' | 'notification' | 'readId';

export interface IUseBluetoothLE {
  requestPermissions: () => Promise<boolean>;
  bleManager: BleManager;
  detectedSmartPots: Array<Device>;
  status: 'scanning' | 'finished' | 'idle' | 'error';
  disconnect: (device: Device) => Promise<Device | null>;
  connect: (
    deviceId: string,
    onConnect?: ((device: Device) => void) | null,
    hideErrors?: boolean
  ) => Promise<Device | null>;
  connectionStatus: TDeviceConnectionStatus;
  connectedDevice: Device | null;
  detectedSmartPots: Array<DeviceWithLastSeen>;
  onConnectionDropped: (cb: (dev: Device | null) => Promise<void>) => () => Promise<void>;
  SERVICE_UUID: string;
  CHARACTERISTIC_MAP: Record<TCharacteristics, string>;
  init: () => void;
  stopDeviceScan: () => void;
  reconnect: (deviceId: string) => Promise<boolean>;
  connectedDeviceRef: Device | null;
}

export interface ISensorData {
  name: TSensorNames;
  id: string;
  connected: boolean;
  data:
    | ITemperatureAndHumiditySensorData
    | ISoilMoistureAndTemperatureSensorData
    | ILightSensorData
    | IWaterLevelSensor;
}

export interface ITemperatureAndHumiditySensorData {
  humidity: number | null;
  temperature: number | null;
}

export type TSoilMoistureLevels = 'Very Dry' | 'Dry' | 'Damp' | 'Wet' | 'Very Wet' | 'Saturated';
export interface ISoilMoistureAndTemperatureSensorData {
  moisture: number | null;
  temperature: number | null;
}

export interface ILightSensorData {
  light: number | null;
}
export interface IWaterLevelSensor {
  level: 'High' | 'Low';
}
export type TSensorNames = 'Humidity and Temperature' | 'Light' | 'Soil Moisture' | 'Water Level';

export interface ISyncPlant {
  deviceName: string;
  plant: string;
  mes_sys: number;
}

export interface ILocalSMARTPotStore extends ISyncPlant {
  id: string;
}

export interface NotificationAddDevice {
  error: string | 0;
  success: boolean;
}

export interface ILocalStoragePlantRecord {
  id: string;
  name: string;
  addedAt: number;
  measurementSystem: 0 | 1;
  plant: string;
}

export interface SaveData {
  deviceName: string;
  selectedPlant: string;
  measurementSystem: 0 | 1;
}

export interface IHealthData {
  health: number;
}
