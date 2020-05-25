import { Roles, UserDetails } from './users';

export enum Tabs {
  HOME = 'home',
  MANAGE = 'manage',
  CREATE = 'create',
}

export interface PendingRegistrationItem {
  username: string;
  email: string;
  role: Roles;
}

export interface RegistrationItemAction {
  username: string;
  role: Roles;
  acceptItem: boolean;
}

export interface RegistrationItemActionResponse {
  actionSuccess: boolean;
}

export interface UserItem {
  username: string;
  role: Roles;
}

export interface UserSearchPartialRequest {
  partial: string;
  role: Roles;
}

export interface SelectUsersByRoleRequest {
  role: Roles;
}

export interface DeleteUserResponse {
  deleteSuccess: boolean;
}

export interface EditUserRequest {
  username: string;
  role: Roles;
  details: UserDetails;
}

export interface EditUserResponse {
  editSuccess: boolean;
}

export interface CreateUserRequest {
  role: Roles;
  username: string;
  password: string;
  details: UserDetails;
}

export interface CreateUserResponse {
  usernameTaken: boolean;
  createSuccess: boolean;
}
