import { Component, OnInit } from '@angular/core';
import {
  PendingRegistrationItem,
  RegistrationItemActionResponse,
} from 'src/app/models/admin';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { AdminService } from 'src/app/services/users/admin.service';
import { Roles } from 'src/app/models/users';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css'],
})
export class AdminHomeComponent implements OnInit {
  itemStream$: Observable<PendingRegistrationItem[]>;
  itemsSubscription: Subscription;

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.itemStream$ = this.admin.getPendingRegistrationRequests();
    this.itemsSubscription = this.itemStream$.subscribe();
  }

  doAcceptOrRejectAccountRequest(
    username: string,
    role: Roles,
    isAccepted: boolean
  ): void {
    this.admin
      .attemptPendingItemAction({
        username: username,
        role: role,
        acceptItem: isAccepted,
      })
      .toPromise()
      .then((res: RegistrationItemActionResponse) => {
        if (res.actionSuccess) {
          this.itemStream$ = this.admin.getPendingRegistrationRequests();
        }
      })
      .catch((err: HttpErrorResponse) => {
        if (err.status === 500) {
          alert(
            'Error: Action not completed due to a server error, please try again.'
          );
        }
        console.error(err);
      });
  }

  ngOnDestroy(): void {
    this.itemsSubscription.unsubscribe();
  }
}
