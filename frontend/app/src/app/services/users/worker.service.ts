import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import {
  CreateHothouseRequest,
  CreateHothouseResponse,
} from 'src/app/models/worker';

@Injectable({
  providedIn: 'root',
})
export class WorkerService {
  private _httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
    withCredentials: true,
  };
  private _workerAPI = 'http://localhost:3000/api/worker';

  constructor(private http: HttpClient) {}

  createHothouse(req: CreateHothouseRequest): Promise<CreateHothouseResponse> {
    return this.http
      .post<CreateHothouseResponse>(
        `${this._workerAPI}/hothouse/create`,
        req,
        this._httpOptions
      )
      .toPromise();
  }
}
