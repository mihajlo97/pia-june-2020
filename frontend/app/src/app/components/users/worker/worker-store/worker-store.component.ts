import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ProductItem,
  ProductComment,
  CartItem,
  ConfirmOrderRequest,
  ConfirmOrderResponse,
  CheckOrderHistoryRequest,
  CheckOrderHistoryResponse,
  SaveCommentRequest,
  SaveCommentResponse,
  WarehouseDeliveryInfo,
} from 'src/app/models/worker';
import { WorkerService } from 'src/app/services/users/worker.service';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { map, tap } from 'rxjs/operators';
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
  inputForm: FormGroup;
  warehouseSelect: FormGroup;
  loggedInUser: string;
  cart: CartItem[] = [];
  warehouseStream$: Observable<WarehouseDeliveryInfo[]>;
  warehouses: WarehouseDeliveryInfo[] = [];

  orderSuccess: boolean = true;
  feedbackDisabled: boolean = false;
  saveCommentSuccess: boolean = true;

  constructor(
    private worker: WorkerService,
    private fb: FormBuilder,
    private auth: AuthenticationService
  ) {
    this.itemStream$ = this.getProducts();
    this.inputForm = fb.group({
      quantity: [1],
      rating: [1],
      comment: [''],
    });
    this.warehouseSelect = fb.group({
      warehouse: ['', Validators.required],
    });
    this.selectedProduct.quantity = 1;
    this.loggedInUser = auth.getLoggedInUser();
    this.warehouseStream$ = worker.getWarehouses().pipe(
      tap((values) => {
        this.warehouses = values;
      })
    );
  }

  ngOnInit(): void {}

  //helper methods
  getProducts(): Observable<ProductItem[]> {
    return this.worker.getProducts().pipe(
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
  }

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

  disableSaveComment(): boolean {
    if (this.feedbackDisabled) {
      return true;
    }

    const comment = this.inputForm.get('comment');
    const rating = this.inputForm.get('rating');

    if (rating.dirty && comment.value !== '') {
      return false;
    } else if (comment.value !== '' && comment.dirty) {
      return false;
    }

    return true;
  }

  sortSelectedProductComments(): void {
    this.selectedProduct.comments.sort((a, b) => {
      const aTime = a.commentedOn.getTime();
      const bTime = b.commentedOn.getTime();

      if (aTime === bTime) {
        return 0;
      }
      return aTime < bTime ? 1 : -1;
    });
  }

  //user actions
  addToCart(): void {
    this.cart.push({
      _id: this.selectedProduct._id,
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

  openAddToCartDialog(product: ProductItem): void {
    this.selectedProduct = product;
  }

  cancelAddingToCart(): void {
    this.inputForm.get('quantity').setValue(1);
  }

  viewDetails(product: ProductItem): void {
    this.selectedProduct = product;
    this.sortSelectedProductComments();

    this.inputForm.get('comment').setValue('');
    this.inputForm.get('comment').enable();
    this.inputForm.get('rating').setValue(1);
    this.inputForm.get('rating').enable();

    const req: CheckOrderHistoryRequest = {
      username: this.loggedInUser,
      productID: this.selectedProduct._id,
    };
    this.worker
      .checkOrderHistory(req)
      .then((res: CheckOrderHistoryResponse) => {
        if ('previouslyOrdered' in res) {
          if (!res.previouslyOrdered) {
            this.feedbackDisabled = true;
            this.inputForm.get('comment').disable();
            this.inputForm.get('rating').disable();
          } else {
            this.feedbackDisabled = false;
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
            }
          }
        }
      })
      .catch((err) => {
        console.error(
          'Check-History-Exception: Failed to get a successful history check response from server.',
          err
        );
        this.feedbackDisabled = true;
      });
  }

  saveUserFeedback(): void {
    const index = this.selectedProduct.comments.findIndex(
      (comment) => comment.username === this.loggedInUser
    );
    let comment: ProductComment = {
      username: this.loggedInUser,
      rating: parseInt(this.inputForm.value.rating),
      comment: this.inputForm.value.comment,
      commentedOn: new Date(),
    };

    if (index >= 0) {
      this.selectedProduct.comments[index].rating = parseInt(
        this.inputForm.value.rating
      );
      this.selectedProduct.comments[
        index
      ].comment = this.inputForm.value.comment;
      this.selectedProduct.comments[index].commentedOn = new Date();
    } else {
      this.selectedProduct.comments.push(comment);
    }
    this.sortSelectedProductComments();

    const req: SaveCommentRequest = {
      comment: comment,
      productID: this.selectedProduct._id,
    };
    this.worker
      .updateProductComments(req)
      .then((res: SaveCommentResponse) => {
        this.saveCommentSuccess = res.success;
      })
      .catch((err) => {
        console.error(
          'Confirm-Order-Exception: Server failed to process order.',
          err
        );
        this.saveCommentSuccess = false;
      });
  }

  confirmOrder(): void {
    let req: ConfirmOrderRequest = {
      items: [],
      warehouse: this.warehouses[
        parseInt(this.warehouseSelect.value.warehouse)
      ],
    };
    const now = new Date();

    this.cart.forEach((item) => {
      req.items.push({
        productID: item._id,
        manufacturer: item.manufacturer,
        orderedBy: this.loggedInUser,
        orderedOn: now,
        quantity: item.quantity,
      });
    });

    this.worker
      .confirmOrder(req)
      .then((res: ConfirmOrderResponse) => {
        this.orderSuccess = res.success;
      })
      .catch((err) => {
        console.error(
          'Confirm-Order-Exception: Server failed to process order.',
          err
        );
        this.orderSuccess = false;
      })
      .finally(() => {
        this.cart = [];
        this.itemStream$ = this.getProducts();
        $('#viewCartModal').modal('hide');
        $('#orderResultModal').modal('show');
      });
  }
}
