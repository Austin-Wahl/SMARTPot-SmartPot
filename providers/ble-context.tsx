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
  read: '46f45f15-b963-4e4e-bde9-6a9a677df4b4',
  sendConfig: 'b645f869-3e5d-45ef-b1b6-2c17e0abe75c',
  notification: 'fcd0c4ed-e302-4adc-9f50-71f0de4e6045',
  readId: '4556f68a-e305-4ad2-aa34-e702e53a4b11',
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
  status: 'idle',
  disconnect: async (_device: Device) => null,
  connect: async (
    _deviceId: string,
    _onConnect?: ((device: Device) => void) | null,
    _hideErrors: boolean = false
  ): Promise<Device | null> => {
    return new Promise((resolve) => resolve(null));
  },
  connectionStatus: 'Disconnected',
  detectedSmartPots: [],
  onConnectionDropped: () => {
    return async () => {};
  },
  SERVICE_UUID,
  CHARACTERISTIC_MAP: CHARACTERISTIC_MAP,
  init: () => false,
  stopDeviceScan: () => {},
  connectedDevice: null,
  reconnect: async (_deviceId: string) => new Promise((resolve) => resolve(true)),
  connectedDeviceRef: null,
});

const STALE_DEVICE_TIMEOUT_MS = 5_000;
const SCAN_TIMEOUT = 10_000;
const CLEANUP_INTERVAL = 2_500;

const BLEContext = ({ children }: { children: ReactNode }) => {
  const [connectionStatus, setConnectionStatus] = useState<TDeviceConnectionStatus>('Disconnected');
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const disconnectCallbackRef = useRef<null | ((dev: Device | null) => Promise<void>)>(null);
  const [detectedSmartPots, setDetectedSmartPots] = useState<DeviceWithLastSeen[]>([]);

  const connectedDeviceRef = useRef<Device | null>(null);
  const [status, setStatus] = useState<'scanning' | 'finished' | 'idle' | 'error'>('idle');

  const timeoutRef = useRef<number>(null);
  const cleanupRef = useRef<number>(null);

  useEffect(() => {
    async function loadInitalConnections() {
      const currentlyConnectedDevices = await bleManager.connectedDevices([SERVICE_UUID]);
      if (currentlyConnectedDevices.length > 0) {
        setConnectionStatus('Connected');
        setConnectedDevice(currentlyConnectedDevices[0]);
      }
      const now = Date.now();
      setDetectedSmartPots(
        currentlyConnectedDevices.map((device) => ({
          ...device,
          lastSeen: now,
        })) as Array<DeviceWithLastSeen>
      );
    }

    loadInitalConnections();
  }, []);

  const startDeviceScan = useCallback(async () => {
    const onDeviceFound = (error: BleError | null, device: Device | null) => {
      const now = Date.now();
      if (error) return;
      if (!device) return;

      setDetectedSmartPots((prevDevices) => {
        const devMap: Map<string, DeviceWithLastSeen> = new Map();

        for (const dev of prevDevices) {
          if (connectedDeviceRef.current && dev.id === connectedDeviceRef.current.id) {
            // Always keep the connected device, potentially update its latest properties from scan
            devMap.set(dev.id, { ...dev, ...device, lastSeen: now } as DeviceWithLastSeen);
          } else if (dev.id !== device.id && now - dev.lastSeen < STALE_DEVICE_TIMEOUT_MS) {
            // Keep other devices if they are fresh and not the newly found device
            devMap.set(dev.id, dev);
          }
        }

        devMap.set(device.id, { ...device, lastSeen: now } as DeviceWithLastSeen);

        return Array.from(devMap.values());
      });
    };

    try {
      bleManager.startDeviceScan(
        [SERVICE_UUID],
        {
          allowDuplicates: true,
        },
        onDeviceFound
      );
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : new Error(String(error)).message);
    }
  }, []);

  const stopDeviceScan = () => {
    bleManager.stopDeviceScan();
    setStatus('finished');

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (cleanupRef.current) {
      clearInterval(cleanupRef.current);
      timeoutRef.current = null;
    }
  };

  const onConnectionDropped = useCallback((cb: (dev: Device | null) => Promise<void>) => {
    disconnectCallbackRef.current = cb;

    return () => {
      disconnectCallbackRef.current = null;
      return Promise.resolve();
    };
  }, []);

  useEffect(() => {
    if (!connectedDeviceRef.current) return;

    const subscription = bleManager.onDeviceDisconnected(
      connectedDeviceRef.current.id,
      async (error, device) => {
        setConnectionStatus('Disconnected');
        await disconnectCallbackRef.current?.(device);
      }
    );

    return () => {
      subscription.remove();
    };
  }, [connectedDevice, onConnectionDropped]);

  const clearOldDevices = useCallback(() => {
    setDetectedSmartPots((prevDevices) => {
      const now = Date.now();
      return prevDevices.filter((device) => {
        const old = now - device.lastSeen < STALE_DEVICE_TIMEOUT_MS;
        if (connectedDeviceRef.current && device.id === connectedDeviceRef.current.id) return true;
        return old;
      });
    });
  }, [STALE_DEVICE_TIMEOUT_MS]);

  const init = () => {
    if (status == 'scanning') return;
    function startScan() {
      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(stopDeviceScan, SCAN_TIMEOUT);
      }
      setStatus('scanning');
      startDeviceScan();
    }

    function startCleanup() {
      if (!cleanupRef.current) {
        cleanupRef.current = setInterval(clearOldDevices, CLEANUP_INTERVAL);
      }
      clearOldDevices();
    }

    startScan();
    startCleanup();
  };

  async function connect(
    deviceId: string,
    onConnect?: ((device: Device) => void) | null,
    hideErrors: boolean = false
  ): Promise<Device | null> {
    try {
      setConnectionStatus('Connecting');
      const device = await bleManager.connectToDevice(deviceId, { timeout: 5000 });
      const isConnected = await device.isConnected();
      setConnectionStatus(isConnected ? 'Connected' : 'Disconnected');
      setConnectedDevice(device);
      connectedDeviceRef.current = device;
      if (onConnect) {
        onConnect(device);
      }
      return device;
    } catch (error) {
      if (!hideErrors)
        Toast.error(error instanceof Error ? error.message : new Error(String(error)).message);
      setConnectionStatus('Error');
      return null;
    }
  }

  async function disconnect(device: Device): Promise<Device | null> {
    try {
      setConnectionStatus('Disconnecting');
      if (!connectedDeviceRef.current) {
        setConnectionStatus('Disconnected');
        return null;
      }
      console.log('disconnected 1');

      const dev = await bleManager.cancelDeviceConnection(device.id);
      setConnectionStatus('Disconnected');
      setConnectedDevice(null);
      connectedDeviceRef.current = null;
      if (!dev) throw new Error('Unknown error');
      console.log('disconnected 2');

      return dev;
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : new Error(String(error)).message);
      setConnectionStatus('Connected');
      return null;
    }
  }

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

  return (
    <bleContext.Provider
      value={{
        reconnect,
        connectedDeviceRef: connectedDeviceRef.current,
        CHARACTERISTIC_MAP,
        SERVICE_UUID,
        requestPermissions,
        bleManager,
        connect,
        connectedDevice,
        detectedSmartPots,
        onConnectionDropped,
        connectionStatus,
        init,
        stopDeviceScan,
        status,
        disconnect,
      }}>
      {children}
    </bleContext.Provider>
  );
};

export default BLEContext;
