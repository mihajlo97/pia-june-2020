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
  private root = 'http://localhost:3000/api';

  private loggedInUser = '';
  private allowedRole = ROLE_NONE;

  constructor(private http: HttpClient) {}

  async attemptUserLogin(req: UserLoginRequest): Promise<UserLoginResponse> {
    let response: UserLoginResponse;

    await this.http
      .post<UserLoginResponse>(
        `${this.root}/authentication/login`,
        req,
        this.httpOptions
      )
      .toPromise()
      .then((res) => {
        response = res;
        if (res.username !== '' && res.role !== '') {
          this.loggedInUser = res.username;
          this.allowedRole = res.role;
        }
      })
      .catch((res) => {
        if (res.status >= 500) {
          console.error(res);
          return Promise.resolve(res.error);
        } else {
          response = res.error;
          if (res.username !== '' && res.role !== '') {
            this.loggedInUser = res.username;
            this.allowedRole = res.role;
          }
        }
      });

    return Promise.resolve(response);
  }

  checkUserLoggedIn(): Promise<UserLoggedInResponse> {
    return this.http
      .get<UserLoggedInResponse>(
        `${this.root}/authentication/login`,
        this.httpOptions
      )
      .toPromise();
  }

  attemptUserLogout(req: any): Observable<UserLogoutResponse> {
    const response = this.http.post<UserLogoutResponse>(
      `${this.root}/authentication/logout`,
      req,
      this.httpOptions
    );

    response.subscribe((res: UserLogoutResponse) => {
      if (res.logoutSuccess) {
        this.loggedInUser = '';
        this.allowedRole = ROLE_NONE;
      }
    });

    return response;
  }

  getLoggedInUser(): string {
    return this.loggedInUser;
  }

  getUserRole(): string {
    return this.allowedRole;
  }
}
