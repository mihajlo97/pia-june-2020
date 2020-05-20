import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  PendingRegistrationItem,
  RegistrationItemActionResponse,
  RegistrationItemAction,
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

  attemptPendingItemAction(
    req: RegistrationItemAction
  ): Observable<RegistrationItemActionResponse> {
    console.log('[DEBUG]: Reject-Action: ', req);
    return this.http.post<RegistrationItemActionResponse>(
      `${this._adminAPI}/pending`,
      req,
      this._httpOptions
    );
  }
}
