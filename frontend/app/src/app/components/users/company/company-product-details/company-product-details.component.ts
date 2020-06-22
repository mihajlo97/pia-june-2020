import { Component, OnInit } from '@angular/core';
import { CompanyService } from 'src/app/services/users/company.service';
import { ProductItem } from 'src/app/models/worker';
import { ActivatedRoute } from '@angular/router';
import {
  GetProductRequest,
  GetProductResponse,
  ToggleProductAvailabilityRequest,
} from 'src/app/models/company';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-company-product-details',
  templateUrl: './company-product-details.component.html',
  styleUrls: ['./company-product-details.component.css'],
})
export class CompanyProductDetailsComponent implements OnInit {
  productRequest: GetProductRequest = {} as GetProductRequest;
  product: ProductItem;
  selectForm: FormGroup;
  averageRating: number;

  errorMessageDisplay: boolean = false;

  constructor(
    private company: CompanyService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.productRequest._id = route.snapshot.paramMap.get('id');
    this.selectForm = fb.group({
      available: [''],
    });
    this.loadProduct();
  }

  ngOnInit(): void {}

  loadProduct(): void {
    this.company
      .getProduct(this.productRequest)
      .then((res: GetProductResponse) => {
        if (res.product) {
          this.product = res.product;
          this.errorMessageDisplay = false;

          this.averageRating = this.calculateAverageRating();
          this.selectForm.get('available').setValue(`${res.product.available}`);
          this.selectForm.get('available').valueChanges.subscribe((value) => {
            let availability = null;
            if (value === 'true') {
              availability = true;
            } else if (value === 'false') {
              availability = false;
            }

            if (availability != null) {
              const req: ToggleProductAvailabilityRequest = {
                _id: this.route.snapshot.paramMap.get('id'),
                available: availability,
              };
              this.company.toggleProductAvailability(req).catch((err) => {
                console.error(
                  'Toggle-Product-Availability-Exception: Failed to save availability changes.',
                  err
                );
              });
            }
          });

          this.sortComments();
        } else {
          this.errorMessageDisplay = true;
        }
      })
      .catch((err) => {
        this.errorMessageDisplay = true;
        console.error(
          'Loading-Product-Exception: Failed to fetch product data from the server.',
          err
        );
      });
  }

  sortComments(): void {
    this.product.comments.forEach((comment, index, comments) => {
      comments[index].commentedOn = new Date(comment.commentedOn);
    });
    this.product.comments.sort((a, b) => {
      const aTime = a.commentedOn.getTime();
      const bTime = b.commentedOn.getTime();

      if (aTime === bTime) {
        return 0;
      }
      return aTime < bTime ? 1 : -1;
    });
  }

  calculateAverageRating(): number {
    let sum = 0;
    this.product.comments.forEach((comment) => {
      sum += comment.rating;
    });

    return sum / this.product.comments.length;
  }
}
