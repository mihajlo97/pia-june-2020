import { Roles } from './users';

export enum Tabs {
  HOME = 'home',
  MANAGE = 'manage',
  CREATE = 'create',
}

export interface PendingRegistrationItem {
  username: string;
  email: string;
  role: Roles;
}

export interface RegistrationItemAction {
  username: string;
  role: Roles;
  acceptItem: boolean;
}

export interface RegistrationItemActionResponse {
  actionSuccess: boolean;
}
