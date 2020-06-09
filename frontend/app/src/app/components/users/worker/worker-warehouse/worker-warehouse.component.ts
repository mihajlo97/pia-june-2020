import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkerService } from 'src/app/services/users/worker.service';
import {
  GetWarehouseRequest,
  WarehouseItem,
  FilterWarehouseRequest,
} from 'src/app/models/worker';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-worker-warehouse',
  templateUrl: './worker-warehouse.component.html',
  styleUrls: ['./worker-warehouse.component.css'],
})
export class WorkerWarehouseComponent implements OnInit {
  requestWarehouse: GetWarehouseRequest;
  itemStream$: Observable<WarehouseItem[]>;
  itemSubscription: Subscription;

  queryForm: FormGroup;
  readonly categories = ['name', 'manufacturer', 'quantity'];
  readonly order = ['asc', 'desc'];
  queryRequest: FilterWarehouseRequest;

  constructor(
    private route: ActivatedRoute,
    private worker: WorkerService,
    private fb: FormBuilder
  ) {
    this.requestWarehouse = {
      _id: this.route.snapshot.paramMap.get('id'),
    };
    this.itemStream$ = worker.getWarehouse(this.requestWarehouse);
    this.itemSubscription = this.itemStream$.subscribe();
    this.queryForm = fb.group({
      search: [''],
      category: [this.categories[0]],
      sortCategory: [this.categories[0]],
      sortOrder: ['asc'],
    });
  }

  ngOnInit(): void {}

  search(): void {
    if (this.queryForm.pristine) {
      return;
    }

    this.queryRequest = {
      _id: this.route.snapshot.paramMap.get('id'),
      search: this.queryForm.value.search.toLowerCase(),
      category: this.queryForm.value.category,
      sort: this.queryForm.value.sortCategory,
      order: this.queryForm.value.sortOrder,
    };
    this.itemStream$ = this.worker.filterWarehouse(this.queryRequest);
  }

  ngOnDestroy(): void {
    this.itemSubscription.unsubscribe();
  }
}
