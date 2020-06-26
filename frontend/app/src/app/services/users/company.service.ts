import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ProductBasicInfo,
  GetProductRequest,
  GetProductResponse,
  ToggleProductAvailabilityRequest,
  AddProductRequest,
  AddProductResponse,
  OrderAnalytics,
  GetAnalyticsResponse,
  OrderEntry,
  GetOrderEntriesRequest,
  GetOrderEntriesResponse,
  RejectOrderRequest,
  RejectOrderResponse,
  GetCouriersResponse,
} from 'src/app/models/company';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private readonly _httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
    withCredentials: true,
  };
  private readonly _companyAPI = 'http://localhost:3000/api/company';

  constructor(private http: HttpClient) {}

  getCompanyCatalog(): Observable<ProductBasicInfo[]> {
    return this.http.get<ProductBasicInfo[]>(
      `${this._companyAPI}/catalog`,
      this._httpOptions
    );
  }

  getProduct(req: GetProductRequest): Promise<GetProductResponse> {
    return this.http
      .post<GetProductResponse>(
        `${this._companyAPI}/catalog/product`,
        req,
        this._httpOptions
      )
      .toPromise();
  }

  toggleProductAvailability(
    req: ToggleProductAvailabilityRequest
  ): Promise<void> {
    return this.http
      .post<void>(
        `${this._companyAPI}/catalog/product/availability`,
        req,
        this._httpOptions
      )
      .toPromise();
  }

  addNewProduct(req: AddProductRequest): Promise<AddProductResponse> {
    return this.http
      .post<AddProductResponse>(
        `${this._companyAPI}/catalog/add`,
        req,
        this._httpOptions
      )
      .toPromise();
  }

  getAnalytics(): Promise<GetAnalyticsResponse> {
    return this.http
      .get<GetAnalyticsResponse>(
        `${this._companyAPI}/analytics`,
        this._httpOptions
      )
      .toPromise();
  }

  getOrderEntries(
    req: GetOrderEntriesRequest
  ): Observable<GetOrderEntriesResponse> {
    return this.http.post<GetOrderEntriesResponse>(
      `${this._companyAPI}/orders`,
      req,
      this._httpOptions
    );
  }

  getCouriers(): Promise<GetCouriersResponse> {
    return this.http
      .get<GetCouriersResponse>(
        `${this._companyAPI}/couriers`,
        this._httpOptions
      )
      .toPromise();
  }

  rejectOrder(req: RejectOrderRequest): Promise<RejectOrderResponse> {
    return this.http
      .post<RejectOrderResponse>(
        `${this._companyAPI}/orders/reject`,
        req,
        this._httpOptions
      )
      .toPromise();
  }
}
