import { OrderStatus } from './company';

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

export enum WarehouseItemType {
  SEEDLING = 'seedling',
  FERTILIZER = 'fertilizer',
}

export const WATER_DEFAULT = 200;
export const WATER_MIN = 0;
export const WATER_MAX = 1000;
export const WATER_LOW = 75;
export const TEMPERATURE_DEFAULT = 18;
export const TEMPERATURE_MIN = -20;
export const TEMPERATURE_MAX = 50;
export const TEMPERATURE_LOW = 12;
export const PROGRESS_MAX = 100;
export const PROGRESS_MIN = 0;
export const PREPARING_TIME = 1000 * 60 * 60 * 24;
export const DAY_IN_MILIS = 1000 * 60 * 60 * 24;
export const DASHBOARD_REFRESH_RATE = 1000 * 60;
export const UPDATE_CONDITIONS_EVERY_MILIS = 1000 * 60 * 60;
export const WATER_LEVEL_DECREASE = 1;
export const TEMPERATURE_LEVEL_DECREASE = 0.5;

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
  conditionsLastUpdatedOn: Date;
}

export interface WarehouseItem {
  _id: string;
  name: string;
  type: WarehouseItemType;
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
  _id: string;
  row: number;
  col: number;
  occupied: boolean;
  lastOccupiedOn: Date;
}

export interface Seedling {
  _id?: string;
  hothouse: string;
  name: string;
  manufacturer: string;
  row: number;
  col: number;
  plantedOn: Date;
  daysToGrow: number;
  growthAcceleratedBy: number;
  done: boolean;
  picked: boolean;
}

export interface HothouseControl {
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
  name: string;
}

export interface HothouseDashboard {
  _id: string;
  model: HothouseDashboardDataResponse;
  controls: HothouseSpotUIControls[];
}

export interface CreateSeedling {
  hothouse: string;
  name: string;
  manufacturer: string;
  row: number;
  col: number;
  daysToGrow: number;
}

export interface CreateSeedlingRequest {
  seedling: CreateSeedling;
}

export interface UpdateHothouseControl {
  waterAmount?: number;
  temperature?: number;
  conditionsLastUpdatedOn?: Date;
}

export interface UpdateHothouseRequest {
  _id: string;
  controls?: UpdateHothouseControl;
}

export interface UpdateWarehouseItemRequest {
  _id: string;
  hothouse: string;
  quantity: number;
}

export interface UpdateSeedlingRequest {
  _id: string;
  accelerateGrowthBy?: number;
  done?: boolean;
  picked?: boolean;
}

export interface UpdateDashboardResponse {
  success: boolean;
}

export interface NotifyUserRequest {
  _id: string;
}

export interface NotifyUserResponse {
  success: boolean;
}

export interface LowConditionNotification {
  hothouseID: string;
  name: string;
  toastrID: number;
}

export interface EmailNotificationRegistry {
  hothouseID: string;
}

export interface ProductItem {
  _id: string;
  name: string;
  manufacturer: string;
  type: WarehouseItemType;
  unitPrice: number;
  quantity: number;
  available: boolean;
  daysToGrow?: number;
  accelerateGrowthBy?: number;
  comments: ProductComment[];
}

export interface ProductComment {
  username: string;
  rating: number;
  comment: string;
  commentedOn: Date;
}

export interface CartItem {
  _id: string;
  name: string;
  manufacturer: string;
  price: number;
  quantity: number;
}

export interface OrderItem {
  productID: string;
  manufacturer: string;
  orderedBy: string;
  orderedOn: Date;
  quantity: number;
}

export interface ConfirmOrderRequest {
  items: OrderItem[];
  warehouse: WarehouseDeliveryInfo;
}

export interface ConfirmOrderResponse {
  success: boolean;
}

export interface CheckOrderHistoryRequest {
  username: string;
  productID: string;
}

export interface CheckOrderHistoryResponse {
  previouslyOrdered?: boolean;
}

export interface SaveCommentRequest {
  comment: ProductComment;
  productID: string;
}

export interface SaveCommentResponse {
  success: boolean;
}

export interface GetUndeliveredOrdersRequest {
  username: string;
}

export interface OrderedItem {
  groupOrderId: string;
  manufacturer: string;
  orderedOn: Date;
  product: string;
  quantity: number;
  status: OrderStatus;
}

export interface OrderedGroupItem {
  groupOrderId: string;
  manufacturer: string;
  orderedOn: Date;
  status: OrderStatus;
  products: string[];
  quantities: number[];
}

export interface CancelOrderRequest {
  groupOrderId: string;
}

export interface CancelOrderResponse {
  success: boolean;
}

export interface WarehouseDeliveryInfo {
  _id: string;
  name: string;
  location: string;
}
