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

export type TCharacteristics = 'read';

export interface IUseBluetoothLE {
  reconnect: (deviceId: string) => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  bleManager: BleManager;
  detectedSmartPots: Array<Device>;
  startDeviceScan: () => Promise<void>;
  refreshDevices: () => Promise<void>;
  status: 'scanning' | 'finished' | 'idle' | 'error';
  disconnect: (device: Device) => Promise<Device | null>;
  connect: (
    deviceId: string,
    onConnect?: ((device: Device) => void) | null,
    hideErrors?: boolean
  ) => Promise<boolean>;
  connectionStatus: TDeviceConnectionStatus;
  connectedDevice: Device | null;
  onConnectionDropped: (cb: (dev: Device | null) => void) => () => void;
  SERVICE_UUID: string;
  CHARACTERISTIC_MAP: Record<TCharacteristics, string>;
}

export interface ISensorData {
  name: TSensorNames;
  id: string;
  connected: boolean;
  data:
    | ITemperatureAndHumiditySensorData
    | ISoilMoistureAndTemperatureSensorData
    | ILightSensorData;
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
export type TSensorNames = 'Humidity and Temperature' | 'Light' | 'Soil Moisture';
