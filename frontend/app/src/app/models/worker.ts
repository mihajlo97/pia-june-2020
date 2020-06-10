export enum Tabs {
  HOME = 'home',
  ORDERS = 'orders',
  STORE = 'store',
  CREATE = 'create',
}

export enum SpotState {
  EMPTY = 'empty',
  PREPARING = 'preparing',
  GROWING = 'growing',
  DONE = 'done',
}

export const WATER_DEFAULT = 200;
export const WATER_MIN = 0;
export const WATER_MAX = 1000;
export const TEMPERATURE_DEFAULT = 18;
export const TEMPERATURE_MIN = -20;
export const TEMPERATURE_MAX = 50;
export const PROGRESS_MAX = 100;
export const PROGRESS_MIN = 0;
export const PREPARING_TIME = 1000 * 60 * 60 * 24;

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

export interface HothouseSpot {
  row: number;
  col: number;
  occupied: boolean;
  lastOccupiedOn: Date;
}

export interface Seedling {
  _id: string;
  name: string;
  manufacturer: string;
  row: number;
  col: number;
  plantedOn: Date;
  daysToGrow: number;
  done: boolean;
  picked: boolean;
}

export interface HothouseControl {
  capacity: number;
  width: number;
  height: number;
  occupiedSpots: number;
  waterAmount: number;
  temperature: number;
  conditionsLastUpdatedOn: Date;
}

export interface HothouseSpotUIControls {
  display: boolean;
  state: SpotState;
  progress: number;
  seedling: Seedling;
  spot: HothouseSpot;
}

export interface HothouseDashboardDataRequest {
  _id: string;
}

export interface HothouseDashboardDataResponse {
  hothouseControl: HothouseControl;
  hothouseSpots: HothouseSpot[];
  warehouseItems: WarehouseItem[];
  seedlings: Seedling[];
}

export interface HothouseDashboard {
  _id: string;
  model: HothouseDashboardDataResponse;
  controls: HothouseSpotUIControls[];
}
