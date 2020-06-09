import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import {
  CreateHothouseRequest,
  CreateHothouseResponse,
  HothouseItem,
  WarehouseItem,
  GetWarehouseRequest,
  FilterWarehouseRequest,
} from 'src/app/models/worker';
import { Observable } from 'rxjs';

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

  getHothouses(): Observable<HothouseItem[]> {
    return this.http.get<HothouseItem[]>(
      `${this._workerAPI}/hothouse`,
      this._httpOptions
    );
  }

  getWarehouse(req: GetWarehouseRequest): Observable<WarehouseItem[]> {
    return this.http.post<WarehouseItem[]>(
      `${this._workerAPI}/hothouse/warehouse`,
      req,
      this._httpOptions
    );
  }

  filterWarehouse(req: FilterWarehouseRequest): Observable<WarehouseItem[]> {
    return this.http.post<WarehouseItem[]>(
      `${this._workerAPI}/hothouse/warehouse/filter`,
      req,
      this._httpOptions
    );
  }
}
