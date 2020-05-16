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
  isLoggedIn: boolean;
}

export interface UserLogoutResponse {
  logoutSuccess: boolean;
}
