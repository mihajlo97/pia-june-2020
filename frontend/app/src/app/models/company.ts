import { ProductItem } from './worker';

export enum Tabs {
  HOME = 'home',
  ANALYTICS = 'analytics',
  CATALOG = 'catalog',
  NEW = 'new-product',
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
