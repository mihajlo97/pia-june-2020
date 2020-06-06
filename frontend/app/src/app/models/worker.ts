export enum Tabs {
  HOME = 'home',
  ORDERS = 'orders',
  STORE = 'store',
  CREATE = 'create',
}

export interface CreateHothouseRequest {
  username: string;
  name: string;
  location: string;
  width: number;
  height: number;
}

export interface CreateHothouseResponse {
  success: boolean;
}
