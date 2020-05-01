import { Farmer } from './users';

export interface SendWorkerRegistrationRequest {
  user: Farmer;
  token: string;
}

export interface SendWorkerRegistrationResponse {
  captchaOK: boolean;
  usernameOK: boolean;
  success: boolean;
}
