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
} from 'src/app/models/company';
import { CompanyService } from 'src/app/services/users/company.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
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
  actionTaken: ActionTaken;
  courierFetchDone: boolean = false;

  maxCourierCount: number = -1;
  courierCount: number = -1;
  sortByForm: FormGroup;
  orderStream$: Observable<GroupOrderEntry[]>;
  couriers: Courier[];

  constructor(private company: CompanyService, private fb: FormBuilder) {
    this.sortByForm = fb.group({
      sort: [SortBy.ASC],
    });

    this.getOrders();
    this.getCouriers();

    this.sortByForm.get('sort').valueChanges.subscribe((value) => {
      this.getOrders();
    });
  }

  ngOnInit(): void {}

  //helper methods
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
          this.couriers = res.couriers;

          res.couriers.forEach((courier) => {
            if (courier.available) {
              this.courierCount++;
            }
          });
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

  notifyActionFail(err: any, action: ActionTaken): void {
    console.error(
      'On-Order-Action-Exception: Failed to execute action successfully.',
      err
    );
    this.actionTaken = action;
    $('#actionFailModal').modal('show');
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
          this.couriers[index].deliveryDate = res.deliveryDate;
          this.couriers[index].returnDate = res.returnDate;

          this.courierCount--;
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
          this.getOrders();
        } else {
          this.actionTaken = ActionTaken.REJECT;
          $('#actionFailModal').modal('show');
        }
      })
      .catch((err) => {
        this.notifyActionFail(err, ActionTaken.REJECT);
      });
  }
}
