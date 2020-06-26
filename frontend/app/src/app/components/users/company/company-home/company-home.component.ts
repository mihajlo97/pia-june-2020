import { Component, OnInit } from '@angular/core';
import {
  MAX_COURIER_COUNT,
  GroupOrderEntry,
  OrderStatus,
  RejectOrderResponse,
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

  maxCourierCount: number = MAX_COURIER_COUNT;
  courierCount: number = MAX_COURIER_COUNT;
  sortByForm: FormGroup;
  orderStream$: Observable<GroupOrderEntry[]>;

  constructor(private company: CompanyService, private fb: FormBuilder) {
    this.sortByForm = fb.group({
      sort: [SortBy.DESC],
    });
    this.getOrders();
    this.sortByForm.get('sort').valueChanges.subscribe(() => {
      this.getOrders();
    });
  }

  ngOnInit(): void {}

  getOrders(): void {
    this.orderStream$ = this.company
      .getOrderEntries({ sort: this.sortByForm.value.sort })
      .pipe(
        map((res, index) => {
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
        })
      );
  }

  acceptOrder(order: GroupOrderEntry): void {}

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
        console.error(
          'On-Order-Action-Exception: Failed to execute action successfully.',
          err
        );
        this.actionTaken = ActionTaken.REJECT;
        $('#actionFailModal').modal('show');
      });
  }
}
