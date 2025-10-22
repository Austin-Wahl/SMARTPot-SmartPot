import { Device } from 'react-native-ble-plx';
export interface ITeamMember {
  name: string;
  role: string;
  picture: string;
}

export type DeviceWithLastSeen = Device & { lastSeen: number };
