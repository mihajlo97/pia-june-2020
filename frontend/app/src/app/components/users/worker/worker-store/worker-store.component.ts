import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductItem, ProductComment } from 'src/app/models/worker';
import { WorkerService } from 'src/app/services/users/worker.service';

@Component({
  selector: 'app-worker-store',
  templateUrl: './worker-store.component.html',
  styleUrls: ['./worker-store.component.css'],
})
export class WorkerStoreComponent implements OnInit {
  itemStream$: Observable<ProductItem[]>;

  constructor(private worker: WorkerService) {
    this.itemStream$ = worker.getProducts();
  }

  ngOnInit(): void {}

  viewCart(): void {}

  confirmOrder(): void {}

  averageRating(comments: ProductComment[]): number {
    return 0;
  }

  addToCart(product: ProductItem): void {}

  viewDetails(product: ProductItem): void {}
}
