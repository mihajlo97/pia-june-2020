import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductItem, ProductComment, CartItem } from 'src/app/models/worker';
import { WorkerService } from 'src/app/services/users/worker.service';
import { FormBuilder, FormGroup } from '@angular/forms';

//use jQuery
declare var $: any;

@Component({
  selector: 'app-worker-store',
  templateUrl: './worker-store.component.html',
  styleUrls: ['./worker-store.component.css'],
})
export class WorkerStoreComponent implements OnInit {
  itemStream$: Observable<ProductItem[]>;
  selectedProduct: ProductItem = {} as ProductItem;
  cart: CartItem[] = [
    {
      name: 'Test 1',
      manufacturer: 'Testers',
      price: 4000,
      quantity: 20,
    },
    {
      name: 'Test 2',
      manufacturer: 'Other testers',
      price: 6500,
      quantity: 32,
    },
  ];

  orderSuccess: boolean = true;
  inputForm: FormGroup;

  constructor(private worker: WorkerService, private fb: FormBuilder) {
    this.itemStream$ = worker.getProducts();
    this.inputForm = fb.group({
      quantity: [1],
    });
    this.selectedProduct.quantity = 1;
  }

  ngOnInit(): void {}

  //helper methods
  caluclateAverageRating(comments: ProductComment[]): number {
    if (!comments || comments === []) {
      return -1;
    }

    let sum = 0;
    comments.forEach((comment) => {
      sum += comment.rating;
    });
    return sum / comments.length;
  }

  calculateBilling(): number {
    let sum = 0;
    this.cart.forEach((item) => {
      sum += item.price;
    });
    return sum;
  }

  showAverageRating(comments: ProductComment[]): string {
    const avg = this.caluclateAverageRating(comments);
    return avg >= 0 ? '' + avg : 'No ratings yet';
  }

  validateQuantity(): boolean {
    return (
      this.inputForm.value.quantity > 0 &&
      this.inputForm.value.quantity <= this.selectedProduct.quantity
    );
  }

  cancelAddingToCart(): void {
    this.inputForm.get('quantity').setValue(1);
  }

  //user actions
  addToCart(): void {
    this.cart.push({
      name: this.selectedProduct.name,
      manufacturer: this.selectedProduct.manufacturer,
      quantity: this.inputForm.value.quantity,
      price: this.inputForm.value.quantity * this.selectedProduct.unitPrice,
    });
    this.inputForm.get('quantity').setValue(1);
    $('#viewCartModal').modal('hide');
  }

  removeFromCart(id: number): void {
    this.cart.splice(id, 1);
  }

  confirmOrder(): void {
    $('#viewCartModal').modal('hide');
    $('#orderResultModal').modal('show');
  }

  openAddToCartDialog(product: ProductItem): void {
    this.selectedProduct = product;
    $('#addToCartModal').modal('show');
  }

  viewDetails(product: ProductItem): void {
    this.selectedProduct = product;
  }
}
