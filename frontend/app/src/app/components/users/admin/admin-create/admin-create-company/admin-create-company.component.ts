import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { CreateUserRequest, CreateUserResponse } from 'src/app/models/admin';
import { AdminService } from 'src/app/services/users/admin.service';
import { Roles } from 'src/app/models/users';

//use jQuery
declare var $: any;

@Component({
  selector: 'app-admin-create-company',
  templateUrl: './admin-create-company.component.html',
  styleUrls: ['./admin-create-company.component.css'],
})
export class AdminCreateCompanyComponent implements OnInit {
  createForm: FormGroup;
  createRequest: CreateUserRequest;

  //validation
  usernameRegex: RegExp;
  passwordRegex: RegExp;
  passwordRegexAlt: RegExp;
  phoneNumberRegex: RegExp;
  readonly currentYear = new Date().getFullYear();

  //show user error messages
  didServerCreatUserFail: boolean = false;
  usernameAlreadyTaken: boolean = false;

  constructor(private fb: FormBuilder, private admin: AdminService) {
    this.passwordRegex = new RegExp(
      '^[a-z](?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$'
    );
    this.passwordRegexAlt = new RegExp(
      '^[A-Z](?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$'
    );
    this.usernameRegex = new RegExp('^[a-zA-Z0-9., ]{2,50}$');
    this.phoneNumberRegex = new RegExp(
      '^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]{9,20}$'
    );

    this.createForm = fb.group({
      username: [
        '',
        Validators.compose([Validators.required, this.validateUsername()]),
      ],
      password: [
        '',
        Validators.compose([Validators.required, this.validatePassword()]),
      ],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      name: ['', Validators.required],
      foundingDay: [
        '1',
        Validators.compose([Validators.required, this.foundingDayValidator()]),
      ],
      foundingMonth: [
        '1',
        Validators.compose([
          Validators.required,
          this.foundingMonthValidator(),
        ]),
      ],
      foundingYear: [
        this.currentYear,
        Validators.compose([Validators.required, this.foundingYearValidator()]),
      ],
      hq: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  validateUsername(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control) {
        return null;
      }
      return this.usernameRegex.test(control.value)
        ? null
        : { invalidField: true };
    };
  }

  validatePassword(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control) {
        return null;
      }
      return this.passwordRegex.test(control.value) ||
        this.passwordRegexAlt.test(control.value)
        ? null
        : { invalidField: true };
    };
  }

  foundingDayValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }

      let day = parseInt(control.value);
      if (day < 1 || day > 31) {
        return { invalidField: true };
      }

      const month = this.createForm ? this.createForm.value.birthdateMonth : 1;
      const year = this.createForm
        ? this.createForm.value.birthdateMonth
        : this.currentYear;

      if (month === 2) {
        const isLeapYear =
          (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
        if (isLeapYear && day > 29) {
          return { invalidField: true };
        } else if (!isLeapYear && day > 28) {
          return { invalidField: true };
        }
      } else {
        if (day > 30 && [4, 6, 9, 11].lastIndexOf(month) > -1) {
          return { invalidField: true };
        }
      }

      return null;
    };
  }

  foundingMonthValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }
      return parseInt(control.value) > 12 || parseInt(control.value) < 1
        ? { invalidField: true }
        : null;
    };
  }

  foundingYearValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }
      return parseInt(control.value) > this.currentYear ||
        parseInt(control.value) < 1000
        ? { invalidField: true }
        : null;
    };
  }

  createUser(): void {
    this.didServerCreatUserFail = false;
    this.usernameAlreadyTaken = false;

    let founded = new Date();
    founded.setDate(this.createForm.value.foundingDay);
    founded.setMonth(this.createForm.value.foundingMonth);
    founded.setFullYear(this.createForm.value.foundingYear);

    this.createRequest = {
      username: this.createForm.value.username,
      password: this.createForm.value.password,
      role: Roles.COMPANY,
      details: {
        email: this.createForm.value.email,
        name: this.createForm.value.name,
        foundingDate: founded,
        hq: this.createForm.value.hq,
      },
    };

    this.admin
      .createUser(this.createRequest)
      .then((res: CreateUserResponse) => {
        if (res.createSuccess) {
          $('#successModal').modal('show');
        } else {
          if (res.usernameTaken) {
            this.usernameAlreadyTaken = true;
          } else {
            this.didServerCreatUserFail = true;
          }
        }
      });
  }

  clearForm(): void {
    this.didServerCreatUserFail = false;
    this.usernameAlreadyTaken = false;
    this.createForm.reset();
  }

  closeModal(): void {
    this.createForm.reset();
    $('#successModal').modal('hide');
  }
}
