import { Component, OnInit } from '@angular/core';
import { WorkerService } from 'src/app/services/users/worker.service';
import { Observable } from 'rxjs';
import {
  OrderedGroupItem,
  CancelOrderRequest,
  CancelOrderResponse,
} from 'src/app/models/worker';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { map } from 'rxjs/operators';
import { OrderStatus } from 'src/app/models/company';

//use jQuery
declare var $: any;

@Component({
  selector: 'app-worker-orders',
  templateUrl: './worker-orders.component.html',
  styleUrls: ['./worker-orders.component.css'],
})
export class WorkerOrdersComponent implements OnInit {
  OrderStatus = OrderStatus;
  orderStream$: Observable<OrderedGroupItem[]>;
  selectedOrder: OrderedGroupItem;
  loggedInUser: string;
  cancelSuccess: boolean = true;

  constructor(
    private worker: WorkerService,
    private auth: AuthenticationService
  ) {
    this.loggedInUser = auth.getLoggedInUser();
    this.orderStream$ = this.loadOrders();
  }

  ngOnInit(): void {}

  loadOrders(): Observable<OrderedGroupItem[]> {
    return this.worker
      .getUndeliveredUserOrders({ username: this.loggedInUser })
      .pipe(
        map((orders, observableIndex) => {
          let groupOrders: OrderedGroupItem[] = [];

          orders.forEach((order) => {
            const index = groupOrders.findIndex(
              (group) => group.groupOrderId === order.groupOrderId
            );

            if (index < 0) {
              let item: OrderedGroupItem = {
                groupOrderId: order.groupOrderId,
                manufacturer: order.manufacturer,
                orderedOn: new Date(order.orderedOn),
                status: order.status,
                products: [],
                quantities: [],
              };
              item.products.push(order.product);
              item.quantities.push(order.quantity);
              groupOrders.push(item);
            } else {
              groupOrders[index].products.push(order.product);
              groupOrders[index].quantities.push(order.quantity);
            }
          });

          return groupOrders;
        })
      );
  }

  selectOrder(order: OrderedGroupItem): void {
    this.selectedOrder = order;
  }

  cancelOrder(): void {
    const req: CancelOrderRequest = {
      groupOrderId: this.selectedOrder.groupOrderId,
    };

    this.worker
      .cancelOrder(req)
      .then((res: CancelOrderResponse) => {
        this.cancelSuccess = res.success;
        if (res.success) {
          this.orderStream$ = this.loadOrders();
          $('#cancelDialogModal').modal('hide');
        }
      })
      .catch((err) => {
        this.cancelSuccess = false;
        console.error(
          'Cancel-Order-Exception: Failed to successfully cancel selected order.',
          err
        );
      });
  }
}
