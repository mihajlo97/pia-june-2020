import { Component, OnInit } from '@angular/core';
import {
  GroupOrderEntry,
  OrderStatus,
  RejectOrderResponse,
  GetCouriersResponse,
  Courier,
  AcceptOrderRequest,
  AcceptOrderResponse,
  GetOrderEntriesResponse,
  CourierStatus,
  DeliverOrderResponse,
  ReturnToHQResponse,
} from 'src/app/models/company';
import { CompanyService } from 'src/app/services/users/company.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

//use jQuery
declare var $: any;

enum SortBy {
  ASC = 'ascending',
  DESC = 'descending',
}

enum ActionTaken {
  ACCEPT = 'accept',
  REJECT = 'reject',
}

@Component({
  selector: 'app-company-home',
  templateUrl: './company-home.component.html',
  styleUrls: ['./company-home.component.css'],
})
export class CompanyHomeComponent implements OnInit {
  SortBy = SortBy;
  OrderStatus = OrderStatus;
  CourierStatus = CourierStatus;
  actionTaken: ActionTaken;
  courierFetchDone: boolean = false;
  readonly COURIER_REFRESH_RATE = 1000 * 60;

  maxCourierCount: number = -1;
  courierCount: number = -1;
  sortByForm: FormGroup;
  orderStream$: Observable<GroupOrderEntry[]>;

  couriers: Courier[] = [] as Courier[];
  courierStream$: Observable<Courier[]>;
  courierSubscription: Subscription;

  constructor(private company: CompanyService, private fb: FormBuilder) {
    this.sortByForm = fb.group({
      sort: [SortBy.ASC],
    });

    this.getOrders();
    this.getCouriers();

    this.sortByForm.get('sort').valueChanges.subscribe((value) => {
      this.getOrders();
    });

    this.intervalRefreshCheck();
  }

  ngOnInit(): void {}

  //helper methods
  mapOffsetDeliveryDates(courier: Courier): Courier {
    const timezoneOffset = 1000 * 60 * 60 * 2;
    const deliveryBase = new Date(courier.deliveryDate).getTime();
    const returnBase = new Date(courier.returnDate).getTime();

    courier.deliveryDate = new Date(deliveryBase - timezoneOffset);
    courier.returnDate = new Date(returnBase - timezoneOffset);

    return courier;
  }

  groupOrderEntries(
    res: GetOrderEntriesResponse,
    index: number
  ): GroupOrderEntry[] {
    let groupedOrders: GroupOrderEntry[] = [];
    let groupIDs = [];

    res.entries.forEach((order) => {
      const id = groupIDs.findIndex(
        (groupID) => order.groupOrderId === groupID
      );
      if (id >= 0) {
        groupedOrders[id].entries.push(order);
      } else {
        groupIDs.push(order.groupOrderId);
        groupedOrders.push({
          groupOrderId: order.groupOrderId,
          orderedOn: new Date(order.orderedOn),
          status: order.status,
          entries: [],
        });
        groupedOrders[groupedOrders.length - 1].entries.push(order);
      }
    });

    return groupedOrders;
  }

  getOrders(): void {
    this.orderStream$ = this.company
      .getOrderEntries({
        sort: this.sortByForm.get('sort').value,
      })
      .pipe(map(this.groupOrderEntries));
  }

  getOrdersByStatus(): void {
    this.orderStream$ = this.company
      .getOrderEntriesByStatus()
      .pipe(map(this.groupOrderEntries));
  }

  getCouriers(): void {
    this.company
      .getCouriers()
      .then((res: GetCouriersResponse) => {
        if (res.couriers) {
          this.courierCount = 0;
          this.maxCourierCount = res.maxCount;
          res.couriers.forEach((courier, index) => {
            this.couriers[index] = this.mapOffsetDeliveryDates(courier);
          });

          res.couriers.forEach((courier) => {
            if (courier.available) {
              this.courierCount++;
            }
          });

          this.emitCouriers();
          if (this.courierCount === 0) {
            this.getOrdersByStatus();
          }
          this.checkUpdateDeliveries();
        }
      })
      .catch((err) => {
        console.error(
          'Fetch-Courier-Exception: Failed to fetch courier data from server.',
          err
        );
      })
      .finally(() => {
        this.courierFetchDone = true;
      });
  }

  emitCouriers(): void {
    if (this.courierSubscription) {
      this.courierSubscription.unsubscribe();
    }
    this.courierStream$ = new Observable((observer) => {
      observer.next(this.couriers);
      observer.complete();
    });
    this.courierSubscription = this.courierStream$.subscribe();
  }

  notifyActionFail(err: any, action: ActionTaken): void {
    console.error(
      'On-Order-Action-Exception: Failed to execute action successfully.',
      err
    );
    this.actionTaken = action;
    $('#actionFailModal').modal('show');
  }

  //interval updates
  checkUpdateDeliveries(): void {
    const now = Date.now();

    for (let i = 0; i < this.couriers.length; i++) {
      if (this.couriers[i].available) {
        continue;
      }

      if (
        this.couriers[i].deliveryDate.getTime() <= now &&
        this.couriers[i].status === CourierStatus.DELIVERING
      ) {
        this.company
          .deliverOrder({ _id: this.couriers[i]._id })
          .then((res: DeliverOrderResponse) => {
            if (res.success) {
              this.couriers[i].status = CourierStatus.RETURNING;
              this.emitCouriers();
              this.getOrders();
            }
          })
          .catch((err) => {
            console.error(
              'Courier-Delivery-Exception: Failed to update data upon delivery.',
              err
            );
          });
      }

      if (
        this.couriers[i].returnDate.getTime() <= now &&
        this.couriers[i].status === CourierStatus.RETURNING
      ) {
        this.company
          .returnToHQ({ _id: this.couriers[i]._id })
          .then((res: ReturnToHQResponse) => {
            if (res.success) {
              this.couriers[i].available = true;
              this.couriers[i].status = CourierStatus.IDLE;
              this.emitCouriers();
            }
          })
          .catch((err) => {
            console.error(
              'Courier-Delivery-Exception: Failed to update data upon returning to HQ.',
              err
            );
          });
      }
    }
  }

  intervalRefreshCheck(): void {
    setInterval(() => {
      this.checkUpdateDeliveries();
    }, this.COURIER_REFRESH_RATE);
  }

  //user actions
  acceptOrder(order: GroupOrderEntry): void {
    const index = this.couriers.findIndex((item) => item.available === true);
    if (index < 0) {
      console.error(
        'Unavailable-Couriers-Exception: Cannot find an available courier to accept this order.'
      );
      return;
    }

    const req: AcceptOrderRequest = {
      courierId: this.couriers[index]._id,
      groupOrderId: order.groupOrderId,
    };
    this.company
      .acceptOrder(req)
      .then((res: AcceptOrderResponse) => {
        if (res.success) {
          order.status = OrderStatus.IN_TRANSIT;

          this.couriers[index].available = false;
          this.couriers[index].deliveryDate = new Date(res.deliveryDate);
          this.couriers[index].returnDate = new Date(res.returnDate);
          this.couriers[index] = this.mapOffsetDeliveryDates(
            this.couriers[index]
          );

          this.courierCount--;
          this.emitCouriers();

          if (this.courierCount === 0) {
            this.getOrdersByStatus();
          }
        }
      })
      .catch((err) => {
        this.notifyActionFail(err, ActionTaken.ACCEPT);
      });
  }

  rejectOrder(order: GroupOrderEntry): void {
    this.company
      .rejectOrder({ groupOrderId: order.groupOrderId })
      .then((res: RejectOrderResponse) => {
        if (res.success) {
          if (this.courierCount > 0) {
            this.getOrders();
          } else {
            this.getOrdersByStatus();
          }
        } else {
          this.actionTaken = ActionTaken.REJECT;
          $('#actionFailModal').modal('show');
        }
      })
      .catch((err) => {
        this.notifyActionFail(err, ActionTaken.REJECT);
      });
  }

  ngOnDestroy(): void {
    if (this.courierSubscription) {
      this.courierSubscription.unsubscribe();
    }
  }
}
