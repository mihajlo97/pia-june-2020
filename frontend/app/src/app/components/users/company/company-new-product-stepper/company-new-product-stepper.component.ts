import { Component, OnInit } from '@angular/core';
import Stepper from 'bs-stepper';
import { CompanyService } from 'src/app/services/users/company.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ProductType,
  NewProductInfo,
  AddProductResponse,
} from 'src/app/models/company';
import { AuthenticationService } from 'src/app/services/authentication.service';

//use jQuery
declare var $: any;

@Component({
  selector: 'app-company-new-product-stepper',
  templateUrl: './company-new-product-stepper.component.html',
  styleUrls: ['./company-new-product-stepper.component.css'],
})
export class CompanyNewProductStepperComponent implements OnInit {
  stepper: any;
  ProductType = ProductType;
  availability: boolean = true;

  wizardStepOne: FormGroup;
  wizardStepTwo: FormGroup;
  wizardStepThree: FormGroup;
  submitFail: boolean;

  constructor(
    private company: CompanyService,
    private auth: AuthenticationService,
    private fb: FormBuilder
  ) {
    $(document).ready(() => {
      this.stepper = new Stepper($('.bs-stepper')[0]);
    });

    this.wizardStepOne = fb.group({
      name: ['', Validators.required],
      type: [this.ProductType.SEEDLING, Validators.required],
    });
    this.wizardStepTwo = fb.group({
      factor: [1, Validators.compose([Validators.required, Validators.min(1)])],
    });
    this.wizardStepThree = fb.group({
      price: [1, Validators.compose([Validators.required, Validators.min(1)])],
      quantity: [
        1,
        Validators.compose([Validators.required, Validators.min(1)]),
      ],
      available: [true, Validators.required],
    });
  }

  ngOnInit(): void {}

  nextStep(): void {
    this.stepper.next();
  }

  prevStep(): void {
    this.stepper.previous();
  }

  finishWizard(): void {
    if (
      this.wizardStepOne.invalid ||
      this.wizardStepTwo.invalid ||
      this.wizardStepThree.invalid
    ) {
      return;
    }

    let product: NewProductInfo = {
      manufacturer: this.auth.getLoggedInUser(),
      name: this.wizardStepOne.value.name,
      type: this.wizardStepOne.value.type,
      unitPrice: parseInt(this.wizardStepThree.value.price),
      quantity: parseInt(this.wizardStepThree.value.quantity),
      available: this.wizardStepThree.value.available == this.availability,
    };
    if (this.wizardStepOne.value.type === ProductType.SEEDLING) {
      product.daysToGrow = parseInt(this.wizardStepTwo.value.factor);
    } else {
      product.accelerateGrowthBy = parseInt(this.wizardStepTwo.value.factor);
    }

    this.company
      .addNewProduct({ product: product })
      .then((res: AddProductResponse) => {
        this.submitFail = !res.success;
        if (res.success) {
          $('#successModal').modal('show');
        }
      })
      .catch((err) => {
        this.submitFail = false;
        console.error(
          'Submit-New-Product-Exception: Failed to add new product to the catalog.',
          err
        );
      });
  }

  closeDialog(): void {
    this.wizardStepOne.reset({ name: '', type: ProductType.SEEDLING });
    this.wizardStepTwo.reset({ factor: 1 });
    this.wizardStepThree.reset({
      price: 1,
      quantity: 1,
      available: true,
    });
    this.stepper.reset();
    $('#successModal').modal('hide');
  }
}
