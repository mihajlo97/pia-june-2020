import { Farmer, Company } from './users';

export interface SendWorkerRegistrationRequest {
  user: Farmer;
  token: string;
}

export interface SendWorkerRegistrationResponse {
  captchaOK: boolean;
  usernameOK: boolean;
  success: boolean;
}

export interface SendCompanyRegistrationRequest {
  user: Company;
  token: string;
}

export interface SendCompanyRegistrationResponse {
  captchaOK: boolean;
  aliasOK: boolean;
  success: boolean;
}
