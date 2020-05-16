import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  UserLoginRequest,
  UserLoginResponse,
  UserLoggedInResponse,
  UserLogoutResponse,
} from '../models/authetication';

const ROLE_NONE = 'none';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
    withCredentials: true,
  };
  private authAPI = 'http://localhost:3000/api/authentication';

  private loggedInUser = '';
  private allowedRole = ROLE_NONE;

  constructor(private http: HttpClient) {}

  async attemptUserLogin(req: UserLoginRequest): Promise<UserLoginResponse> {
    let response: UserLoginResponse;

    await this.http
      .post<UserLoginResponse>(`${this.authAPI}/login`, req, this.httpOptions)
      .toPromise()
      .then((res: UserLoginResponse) => {
        response = res;
        if (res.username !== '' && res.role !== '') {
          this.loggedInUser = res.username;
          this.allowedRole = res.role;
        }
      })
      .catch((res: HttpErrorResponse) => {
        response = res.error;
        if (res.status >= 500) {
          console.error(
            'Authentication-Exception: An internal server error has occurred while attempting to log in the user.\n',
            res
          );
        } else {
          if (response.username !== '' && response.role !== '') {
            this.loggedInUser = response.username;
            this.allowedRole = response.role;
          }
        }
      });

    return Promise.resolve(response);
  }

  async checkUserLoggedIn(): Promise<boolean> {
    let isLoggedIn: boolean;
    await this.http
      .get<UserLoggedInResponse>(`${this.authAPI}/login`, this.httpOptions)
      .toPromise()
      .then((res: UserLoggedInResponse) => {
        isLoggedIn = res.isLoggedIn;
      })
      .catch((res: HttpErrorResponse) => {
        isLoggedIn = res.error.isLoggedIn;
        if (res.status >= 500) {
          console.error(
            'Authentication-Exception: An internal server error has occurred while checking the login status of the user.\n',
            res
          );
        }
      });

    return Promise.resolve(isLoggedIn);
  }

  async attemptUserLogout(): Promise<boolean> {
    let logoutSuccess: boolean;

    await this.http
      .post<UserLogoutResponse>(`${this.authAPI}/logout`, {}, this.httpOptions)
      .toPromise()
      .then((res: UserLogoutResponse) => {
        if (res.logoutSuccess) {
          this.loggedInUser = '';
          this.allowedRole = ROLE_NONE;
        }
        logoutSuccess = res.logoutSuccess;
      })
      .catch((res: HttpErrorResponse) => {
        logoutSuccess = res.error.logoutSuccess;
        if (res.status >= 500) {
          console.error(
            'Authentication-Exception: An internal server error has occurred while attempting to logout the user.\n',
            res
          );
        }
      });

    return Promise.resolve(logoutSuccess);
  }

  getLoggedInUser(): string {
    return this.loggedInUser;
  }

  getUserRole(): string {
    return this.allowedRole;
  }
}
