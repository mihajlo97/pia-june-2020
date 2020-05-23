import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import {
  UserLoginRequest,
  UserLoginResponse,
  UserLoggedInResponse,
  UserLogoutResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '../models/authetication';
import { NavbarOptions } from '../models/navbar';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private _httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
    withCredentials: true,
  };
  private _authAPI = 'http://localhost:3000/api/authentication';

  private _navbarOption: NavbarOptions = {
    loggedInUser: '',
    userRole: '',
  };
  private _navbarOptionsSubject = new BehaviorSubject<NavbarOptions>(
    this._navbarOption
  );
  readonly navbarOption$ = this._navbarOptionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  async attemptUserLogin(req: UserLoginRequest): Promise<UserLoginResponse> {
    let response: UserLoginResponse;

    await this.http
      .post<UserLoginResponse>(`${this._authAPI}/login`, req, this._httpOptions)
      .toPromise()
      .then((res: UserLoginResponse) => {
        response = res;
        if (res.username !== '' && res.role !== '') {
          this._navbarOption.loggedInUser = res.username;
          this._navbarOption.userRole = res.role;
          this._navbarOptionsSubject.next(this._navbarOption);
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
            this._navbarOption.loggedInUser = response.username;
            this._navbarOption.userRole = response.role;
            this._navbarOptionsSubject.next(this._navbarOption);
          }
        }
      });

    return Promise.resolve(response);
  }

  async checkUserLoggedIn(): Promise<UserLoggedInResponse> {
    const response: UserLoggedInResponse = await this.http
      .get<UserLoggedInResponse>(`${this._authAPI}/login`, this._httpOptions)
      .toPromise();
    this._navbarOption.loggedInUser = response.username;
    this._navbarOption.userRole = response.role;
    this._navbarOptionsSubject.next(this._navbarOption);
    return Promise.resolve(response);
  }

  async attemptUserLogout(): Promise<boolean> {
    let logoutSuccess: boolean;

    await this.http
      .post<UserLogoutResponse>(
        `${this._authAPI}/logout`,
        {},
        this._httpOptions
      )
      .toPromise()
      .then((res: UserLogoutResponse) => {
        if (res.logoutSuccess) {
          this._navbarOption.loggedInUser = '';
          this._navbarOption.userRole = '';
          this._navbarOptionsSubject.next(this._navbarOption);
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

  async changePassword(
    req: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> {
    return this.http
      .post<ChangePasswordResponse>(
        `${this._authAPI}/change-password`,
        req,
        this._httpOptions
      )
      .toPromise();
  }

  getLoggedInUser(): string {
    return this._navbarOption.loggedInUser;
  }

  getUserRole(): string {
    return this._navbarOption.userRole;
  }
}
