import {
  DeviceWithLastSeen,
  IUseBluetoothLE,
  TCharacteristics,
  TDeviceConnectionStatus,
} from '@/types';
import React, { createContext, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleError, BleManager, Device } from 'react-native-ble-plx';
import { Toast } from 'toastify-react-native';

const SERVICE_UUID = '6360ec7b-a2b6-41d2-87c6-be45caf92838';
const CHARACTERISTIC_MAP: Record<TCharacteristics, string> = {
  'read-humidity': '46f45f15-b963-4e4e-bde9-6a9a677df4b4',
};

const SCAN_DURATION_MS = 10000;
const RUN_CLEAN_UP_MS = SCAN_DURATION_MS / 4;
const RUN_SCAN_MS = SCAN_DURATION_MS * 2;
const OLD_DEVICE_THRESHOLD = RUN_SCAN_MS + 1000;

const bleManager = new BleManager();

const requestPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const state = await bleManager.state();

    if (state === 'PoweredOn') {
      return true;
    }

    return new Promise<boolean>((resolve) => {
      resolve(true);
    });
  } else {
    const apiLevel =
      typeof Platform.Version === 'string'
        ? parseInt(Platform.Version, 10)
        : (Platform.Version ?? -1);

    if (apiLevel < 31) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Bluetooth Low Energy requires Location',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const bluetoothScanPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        {
          title: 'Location Permission',
          message: 'Bluetooth Low Energy requires Location',
          buttonPositive: 'OK',
        }
      );
      const bluetoothConnectPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        {
          title: 'Location Permission',
          message: 'Bluetooth Low Energy requires Location',
          buttonPositive: 'OK',
        }
      );
      const fineLocationPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Bluetooth Low Energy requires Location',
          buttonPositive: 'OK',
        }
      );

      return (
        bluetoothScanPermission === 'granted' &&
        bluetoothConnectPermission === 'granted' &&
        fineLocationPermission === 'granted'
      );
    }
  }
};

export const bleContext = createContext<IUseBluetoothLE>({
  bleManager: bleManager,
  requestPermissions: async () => false,
  detectedSmartPots: [],
  startDeviceScan: async () => {},
  refreshDevices: async () => {},
  status: 'idle',
  disconnect: async (_device: Device) => null,
  connect: async (
    deviceId: string,
    onConnect?: ((device: Device) => void) | null,
    hideErrors: boolean = false
  ): Promise<boolean> => {
    return new Promise((resolve) => resolve(true));
  },
  reconnect: async (deviceId: string): Promise<boolean> => {
    return new Promise((resolve) => resolve(true));
  },
  connectionStatus: 'Disconnected',
  connectedDevice: null,
  onConnectionDropped: () => {
    return () => {};
  },
  SERVICE_UUID,
  CHARACTERISTIC_MAP: CHARACTERISTIC_MAP,
});

const BLEContext = ({ children }: { children: ReactNode }) => {
  const [detectedSmartPots, setDetectedSmartPots] = useState<Array<DeviceWithLastSeen>>([]);
  const [status, setStatus] = useState<'scanning' | 'finished' | 'idle' | 'error'>('idle');
  const [connectionStatus, setConnectionStatus] = useState<TDeviceConnectionStatus>('Disconnected');
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const disconnectCallbackRef = useRef<null | ((dev: Device | null) => void)>(null);

  const scanTimeoutRef = useRef<number | null>(null);
  const cleanupIntervalRef = useRef<number | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const reconnect = useCallback(async (deviceId: string) => {
    setConnectionStatus('Connecting');
    try {
      const device = await bleManager.connectToDevice(deviceId, { timeout: 15000 });
      const isConnected = await device.isConnected();

      if (isConnected) {
        setConnectionStatus('Connected');
        return true;
      }
    } catch (error) {}

    setConnectionStatus('Disconnected');
    return false;
  }, []);

  const onConnectionDropped = useCallback((cb: (dev: Device | null) => void) => {
    disconnectCallbackRef.current = cb;

    const unsubscribe = () => {
      disconnectCallbackRef.current = null;
    };

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!connectedDevice) return;

    const subscription = bleManager.onDeviceDisconnected(connectedDevice.id, (error, device) => {
      setConnectionStatus('Disconnected');
      disconnectCallbackRef.current?.(device);
    });

    return () => {
      subscription.remove();
    };
  }, [connectedDevice, onConnectionDropped]);

  async function disconnect(device: Device): Promise<Device | null> {
    try {
      setConnectionStatus('Disconnecting');

      const res = await bleManager.cancelDeviceConnection(device.id);
      setConnectedDevice(null);
      setConnectionStatus('Disconnected');

      return res;
    } catch (error) {
      setConnectionStatus('Error');
      Toast.error(error instanceof Error ? error.message : new Error(String(error)).message);
      return null;
    } finally {
      refreshDevices();
    }
  }

  async function connect(
    deviceId: string,
    onConnect?: ((device: Device) => void) | null,
    hideErrors: boolean = false
  ): Promise<boolean> {
    try {
      setConnectionStatus('Connecting');
      const device = await bleManager.connectToDevice(deviceId, { timeout: 5000 });
      const isConnected = await device.isConnected();
      setConnectionStatus(isConnected ? 'Connected' : 'Disconnected');
      setConnectedDevice(device);
      if (onConnect) {
        onConnect(device);
      }
      return true;
    } catch (error) {
      if (!hideErrors)
        Toast.error(error instanceof Error ? error.message : new Error(String(error)).message);
      setConnectionStatus('Error');
      return false;
    }
  }

  const clearScanInterval = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  }, []);

  // Function to set/reset the main scanning interval
  const setScanInterval = useCallback(() => {
    clearScanInterval(); // Ensure any previous interval is cleared before setting a new one
    scanIntervalRef.current = setInterval(() => {
      startDeviceScan();
    }, RUN_SCAN_MS);
  }, [clearScanInterval]);

  const addDeviceToList = (device: Device) => {
    setDetectedSmartPots((prevSmartPots) => {
      const lastSeen = Date.now();
      const existingIndex = prevSmartPots.findIndex((d) => d.id === device.id);

      const newDevice: DeviceWithLastSeen = { ...device, lastSeen } as DeviceWithLastSeen;

      if (existingIndex > -1) {
        const updatedDevices = [...prevSmartPots];
        updatedDevices[existingIndex] = newDevice;
        return updatedDevices;
      } else {
        return [...prevSmartPots, newDevice];
      }
    });
  };

  const clearOldDevices = async () => {
    const now = Date.now();
    const connectedDevices = await bleManager.connectedDevices([SERVICE_UUID]);

    setDetectedSmartPots((previous) => {
      const prev = previous.filter((device) => {
        const exists = connectedDevices.findIndex((value) => value.id === device.id) > -1;
        if (exists) return device;
        return now - device.lastSeen < OLD_DEVICE_THRESHOLD;
      });
      return prev;
    });
  };

  const refreshDevices = useCallback(async () => {
    setScanInterval();
    startDeviceScan();
  }, [setScanInterval]);

  const startDeviceScan = useCallback(async () => {
    setStatus('scanning');
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    scanTimeoutRef.current = setTimeout(() => {
      bleManager.stopDeviceScan();
      setStatus('finished');
      scanTimeoutRef.current = null;
    }, SCAN_DURATION_MS);

    const deviceFoundListener = (error: BleError | null, scannedDevice: Device | null) => {
      if (error) {
        console.error('Scan Error:', error);
        setStatus('error');
        return;
      }
      if (!scannedDevice || !scannedDevice.id) return;
      addDeviceToList(scannedDevice);
    };

    bleManager.startDeviceScan([SERVICE_UUID], { allowDuplicates: true }, deviceFoundListener);
  }, [addDeviceToList]);

  useEffect(() => {
    // Set up the interval
    cleanupIntervalRef.current = setInterval(() => {
      clearOldDevices();
    }, RUN_CLEAN_UP_MS);

    scanIntervalRef.current = setInterval(() => {
      startDeviceScan();
    }, RUN_SCAN_MS);

    // Return a cleanup function to clear the interval when the component unmounts
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
        cleanupIntervalRef.current = null;
      }

      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, []);

  return (
    <bleContext.Provider
      value={{
        bleManager,
        connect,
        connectedDevice,
        connectionStatus,
        detectedSmartPots,
        disconnect,
        refreshDevices,
        requestPermissions,
        startDeviceScan,
        status,
        onConnectionDropped,
        reconnect,
        SERVICE_UUID,
        CHARACTERISTIC_MAP,
      }}>
      {children}
    </bleContext.Provider>
  );
};

export default BLEContext;
