import { ProductItem } from './worker';

export const MAX_COURIER_COUNT = 5;

export enum Tabs {
  HOME = 'home',
  ANALYTICS = 'analytics',
  CATALOG = 'catalog',
  NEW = 'new-product',
}

export enum ProductType {
  SEEDLING = 'seedling',
  FERTILIZER = 'fertilizer',
}

export enum OrderStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in-transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface ProductBasicInfo {
  _id: string;
  name: string;
  quantity: number;
  available: boolean;
}

export interface GetProductRequest {
  _id: string;
}

export interface GetProductResponse {
  product: ProductItem;
}

export interface ToggleProductAvailabilityRequest {
  _id: string;
  available: boolean;
}

export interface NewProductInfo {
  name: string;
  manufacturer: string;
  type: ProductType;
  unitPrice: number;
  quantity: number;
  available: boolean;
  daysToGrow?: number;
  accelerateGrowthBy?: number;
}

export interface AddProductRequest {
  product: NewProductInfo;
}

export interface AddProductResponse {
  success: boolean;
}

export interface OrderAnalytics {
  date: Date;
  orders: number;
}

export interface GetAnalyticsResponse {
  data: OrderAnalytics[];
}

export interface OrderEntry {
  _id: string;
  manufacturer: string;
  orderedBy: string;
  orderedOn: Date;
  product: string;
  quantity: number;
  groupOrderId: string;
  accepted: boolean;
  status: OrderStatus;
  destinationId: string;
  deliverTo: string;
}

export interface GroupOrderEntry {
  groupOrderId: string;
  orderedOn: Date;
  status: OrderStatus;
  entries: OrderEntry[];
}

export interface GetOrderEntriesRequest {
  sort: string;
}

export interface GetOrderEntriesResponse {
  entries: OrderEntry[];
}

export interface RejectOrderRequest {
  groupOrderId: string;
}

export interface RejectOrderResponse {
  success: boolean;
}
