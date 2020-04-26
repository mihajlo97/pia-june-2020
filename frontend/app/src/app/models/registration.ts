import { Farmer } from './users';

export enum Types {
  FARMER = 'farmer',
  COMPANY = 'company',
}

export interface SendRegistrationRequest {
  user: Farmer;
  token: string;
  type: string;
}

export interface SendRegistrationResponse {
  captcha: boolean;
  success: boolean;
}
