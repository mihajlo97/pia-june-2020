import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductItem, ProductComment, CartItem } from 'src/app/models/worker';
import { WorkerService } from 'src/app/services/users/worker.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { map } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/services/authentication.service';

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
  cart: CartItem[] = [];

  orderSuccess: boolean = true;
  inputForm: FormGroup;
  loggedInUser: string;

  constructor(
    private worker: WorkerService,
    private fb: FormBuilder,
    private auth: AuthenticationService
  ) {
    this.itemStream$ = worker.getProducts().pipe(
      map((items, index) => {
        items.forEach((item, itemIndex) => {
          item.comments.forEach((comment, commentIndex) => {
            items[itemIndex].comments[commentIndex].commentedOn = new Date(
              comment.commentedOn
            );
          });
        });
        return items;
      })
    );
    this.inputForm = fb.group({
      quantity: [1],
      rating: [1],
      comment: [''],
    });
    this.selectedProduct.quantity = 1;
    this.loggedInUser = auth.getLoggedInUser();
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
    //$('#addToCartModal').modal('show');
  }

  cancelAddingToCart(): void {
    this.inputForm.get('quantity').setValue(1);
  }

  viewDetails(product: ProductItem): void {
    this.selectedProduct = product;

    const index = this.selectedProduct.comments.findIndex(
      (comment) => comment.username === this.loggedInUser
    );

    if (index >= 0) {
      this.inputForm
        .get('comment')
        .setValue(this.selectedProduct.comments[index].comment);
      this.inputForm
        .get('rating')
        .setValue(this.selectedProduct.comments[index].rating);
    } else {
      this.inputForm.get('comment').setValue('');
      this.inputForm.get('rating').setValue(1);
    }

    this.selectedProduct.comments.sort((a, b) => {
      const aTime = a.commentedOn.getTime();
      const bTime = b.commentedOn.getTime();

      if (aTime === bTime) {
        return 0;
      }

      return aTime < bTime ? 1 : -1;
    });
  }

  saveUserFeedback(): void {
    const index = this.selectedProduct.comments.findIndex(
      (comment) => comment.username === this.loggedInUser
    );

    if (index >= 0) {
      this.selectedProduct.comments[index].rating = parseInt(
        this.inputForm.value.rating
      );
      this.selectedProduct.comments[
        index
      ].comment = this.inputForm.value.comment;
      this.selectedProduct.comments[index].commentedOn = new Date();
    } else {
      this.selectedProduct.comments.push({
        username: this.loggedInUser,
        rating: parseInt(this.inputForm.value.rating),
        comment: this.inputForm.value.comment,
        commentedOn: new Date(),
      });
    }

    this.selectedProduct.comments.sort((a, b) => {
      const aTime = a.commentedOn.getTime();
      const bTime = b.commentedOn.getTime();

      if (aTime === bTime) {
        return 0;
      }

      return aTime < bTime ? 1 : -1;
    });
  }
}
