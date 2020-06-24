import { ProductItem } from './worker';

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
