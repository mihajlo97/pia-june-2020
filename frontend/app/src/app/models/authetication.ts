import { Roles } from './users';

export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface UserLoginResponse {
  userOK: boolean;
  passOK: boolean;
  username: string;
  role: string;
}

export interface UserLoggedInResponse {
  username: string;
  role: Roles;
}

export interface UserLogoutResponse {
  logoutSuccess: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  oldPassMatch: boolean;
  changeSuccess: boolean;
}
