import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  PendingRegistrationItem,
  RegistrationItemActionResponse,
  RegistrationItemAction,
  UserItem,
  UserSearchPartialRequest,
  SelectUsersByRoleRequest,
  DeleteUserResponse,
} from 'src/app/models/admin';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private _httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
    withCredentials: true,
  };
  private _adminAPI = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient) {}

  getPendingRegistrationRequests(): Observable<PendingRegistrationItem[]> {
    return this.http.get<PendingRegistrationItem[]>(
      `${this._adminAPI}/pending`,
      this._httpOptions
    );
  }

  getAllUsers(): Observable<UserItem[]> {
    return this.http.get<UserItem[]>(
      `${this._adminAPI}/users`,
      this._httpOptions
    );
  }

  searchUsers(req: UserSearchPartialRequest): Observable<UserItem[]> {
    return this.http.post<UserItem[]>(
      `${this._adminAPI}/users/search`,
      req,
      this._httpOptions
    );
  }

  getUsersByRole(req: SelectUsersByRoleRequest): Observable<UserItem[]> {
    return this.http.post<UserItem[]>(
      `${this._adminAPI}/users/role`,
      req,
      this._httpOptions
    );
  }

  deleteUser(req: UserItem): Observable<DeleteUserResponse> {
    return this.http.post<DeleteUserResponse>(
      `${this._adminAPI}/users/delete`,
      req,
      this._httpOptions
    );
  }

  attemptPendingItemAction(
    req: RegistrationItemAction
  ): Observable<RegistrationItemActionResponse> {
    return this.http.post<RegistrationItemActionResponse>(
      `${this._adminAPI}/pending`,
      req,
      this._httpOptions
    );
  }
}
