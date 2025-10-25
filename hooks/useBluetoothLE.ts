import { bleContext } from '@/providers/ble-context';
import { IUseBluetoothLE } from '@/types';
import { useContext } from 'react';

const useBluetoothLE = (): IUseBluetoothLE => {
  const context = useContext(bleContext);
  if (!context) {
    throw new Error('useBluetoothLE must be called within a BLEContext provider');
  }

  return context;
};

export default useBluetoothLE;
