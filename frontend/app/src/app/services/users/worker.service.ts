import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import {
  CreateHothouseRequest,
  CreateHothouseResponse,
  HothouseItem,
  WarehouseItem,
  GetWarehouseRequest,
  FilterWarehouseRequest,
  HothouseDashboardDataRequest,
  HothouseDashboardDataResponse,
  CreateSeedlingRequest,
  UpdateDashboardResponse,
  UpdateHothouseRequest,
  UpdateWarehouseItemRequest,
  UpdateSeedlingRequest,
  NotifyUserRequest,
  NotifyUserResponse,
  LowConditionNotification,
  EmailNotificationRegistry,
} from 'src/app/models/worker';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class WorkerService {
  private readonly _httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
    withCredentials: true,
  };
  private readonly _workerAPI = 'http://localhost:3000/api/worker';

  private readonly _NOTIFICATIONS_KEY = 'lowConditionNotifications';
  private readonly _EMAIL_NOTIFICATIONS_KEY = 'emailNotifications';
  private _notifications: LowConditionNotification[];
  private _emailNotifications: EmailNotificationRegistry[];

  constructor(private http: HttpClient, private toastr: ToastrService) {}

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

  getHothouseDashboardData(
    req: HothouseDashboardDataRequest
  ): Promise<HothouseDashboardDataResponse> {
    return this.http
      .post<HothouseDashboardDataResponse>(
        `${this._workerAPI}/hothouse/dashboard`,
        req,
        this._httpOptions
      )
      .toPromise();
  }

  createSeedling(req: CreateSeedlingRequest): Promise<UpdateDashboardResponse> {
    return this.http
      .post<UpdateDashboardResponse>(
        `${this._workerAPI}/hothouse/seedling`,
        req,
        this._httpOptions
      )
      .toPromise();
  }

  updateHothouse(req: UpdateHothouseRequest): Promise<UpdateDashboardResponse> {
    return this.http
      .post<UpdateDashboardResponse>(
        `${this._workerAPI}/hothouse/update`,
        req,
        this._httpOptions
      )
      .toPromise();
  }

  updateWarehouseItem(
    req: UpdateWarehouseItemRequest
  ): Promise<UpdateDashboardResponse> {
    return this.http
      .post<UpdateDashboardResponse>(
        `${this._workerAPI}/hothouse/warehouse/update`,
        req,
        this._httpOptions
      )
      .toPromise();
  }

  updateSeedling(req: UpdateSeedlingRequest): Promise<UpdateDashboardResponse> {
    return this.http
      .post<UpdateDashboardResponse>(
        `${this._workerAPI}/hothouse/seedling/update`,
        req,
        this._httpOptions
      )
      .toPromise();
  }

  notifyUser(req: NotifyUserRequest): Promise<NotifyUserResponse> {
    return this.http
      .post<NotifyUserResponse>(
        `${this._workerAPI}/hothouse/notify`,
        req,
        this._httpOptions
      )
      .toPromise();
  }

  loadNotifications(): void {
    this._notifications = JSON.parse(
      localStorage.getItem(this._NOTIFICATIONS_KEY)
    );
    if (!this._notifications) {
      this._notifications = [];
    }

    this._notifications.forEach((item, index) => {
      this.toastr.remove(this._notifications[index].toastrID);
      this._notifications[
        index
      ].toastrID = this.toastr.warning(
        `Hothouse ${item.name} requires maintenance.`,
        'Low conditions',
        { disableTimeOut: true, tapToDismiss: false }
      ).toastId;
    });

    localStorage.setItem(
      this._NOTIFICATIONS_KEY,
      JSON.stringify(this._notifications)
    );
  }

  manageNotifications(
    hothouseID: string,
    hothouseName: string,
    remove?: boolean
  ): void {
    //retrieve from local storage existing notifications
    this._notifications = JSON.parse(
      localStorage.getItem(this._NOTIFICATIONS_KEY)
    );
    if (!this._notifications) {
      this._notifications = [];
    }
    this._emailNotifications = JSON.parse(
      localStorage.getItem(this._EMAIL_NOTIFICATIONS_KEY)
    );
    if (!this._emailNotifications) {
      this._emailNotifications = [];
    }

    const notificationIndex = this._notifications.findIndex(
      (notification) => notification.hothouseID === hothouseID
    );
    const emailIndex = this._emailNotifications.findIndex(
      (item) => item.hothouseID === hothouseID
    );

    //remove existing notification
    if (remove === true && notificationIndex >= 0) {
      this.toastr.remove(this._notifications[notificationIndex].toastrID);
      this._notifications.splice(notificationIndex, 1);
    }
    if (remove === true && emailIndex >= 0) {
      this._emailNotifications.splice(emailIndex, 1);
    }

    //add new notification
    else if (!remove && notificationIndex < 0) {
      this._notifications.push({
        hothouseID: hothouseID,
        toastrID: this.toastr.warning(
          `Hothouse ${hothouseName} requires maintenance.`,
          'Low conditions',
          { disableTimeOut: true, tapToDismiss: false }
        ).toastId,
        name: hothouseName,
      });

      //send email if notification loaded first time
      if (emailIndex < 0) {
        this._emailNotifications.push({
          hothouseID: hothouseID,
        });
        this.notifyUser({ _id: hothouseID }).catch((err) => {
          console.error(
            'Notify-User-Low-Conditions-Exception: Failed to notify user via email.',
            err
          );
        });
      }
    }

    //save notifications
    localStorage.setItem(
      this._NOTIFICATIONS_KEY,
      JSON.stringify(this._notifications)
    );
    localStorage.setItem(
      this._EMAIL_NOTIFICATIONS_KEY,
      JSON.stringify(this._emailNotifications)
    );
  }
}
