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

export interface HothouseItem {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  occupiedSpots: number;
  waterAmount: number;
  temperature: number;
}

export interface WarehouseItem {
  _id: string;
  name: string;
  type: string;
  manufacturer: string;
  quantity: number;
  daysToGrow?: number;
  accelerateGrowthBy?: number;
}

export interface GetWarehouseRequest {
  _id: string;
}

export interface FilterWarehouseRequest {
  _id: string;
  search: string;
  category: string;
  sort: string;
  order: string;
}
