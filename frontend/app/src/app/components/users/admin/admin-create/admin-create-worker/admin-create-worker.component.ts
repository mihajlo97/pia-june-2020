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
  selector: 'app-admin-create-worker',
  templateUrl: './admin-create-worker.component.html',
  styleUrls: ['./admin-create-worker.component.css'],
})
export class AdminCreateWorkerComponent implements OnInit {
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
    this.usernameRegex = new RegExp('^[a-zA-Z0-9_]{6,50}$');
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
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthdateDay: [
        '1',
        Validators.compose([Validators.required, this.birthdateDayValidator()]),
      ],
      birthdateMonth: [
        '1',
        Validators.compose([
          Validators.required,
          this.birthdateMonthValidator(),
        ]),
      ],
      birthdateYear: [
        this.currentYear,
        Validators.compose([
          Validators.required,
          this.birthdateYearValidator(),
        ]),
      ],
      birthplace: ['', Validators.required],
      phoneNumber: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(this.phoneNumberRegex),
        ]),
      ],
    });
  }

  ngOnInit(): void {}

  validateUsername(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control) {
        return null;
      }
      return this.usernameRegex.test(control.value)
        ? null
        : { invalidUsername: true };
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
        : { invalidPassword: true };
    };
  }

  birthdateDayValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }

      let day = parseInt(control.value);
      if (day < 1 || day > 31) {
        return { invalidBirthdateDay: true };
      }

      const month = this.createForm ? this.createForm.value.birthdateMonth : 1;
      const year = this.createForm
        ? this.createForm.value.birthdateMonth
        : this.currentYear;

      if (month === 2) {
        const isLeapYear =
          (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
        if (isLeapYear && day > 29) {
          return { invalidBirthdateDay: true };
        } else if (!isLeapYear && day > 28) {
          return { invalidBirthdateDay: true };
        }
      } else {
        if (day > 30 && [4, 6, 9, 11].lastIndexOf(month) > -1) {
          return { invalidBirthdateDay: true };
        }
      }

      return null;
    };
  }

  birthdateMonthValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }
      return parseInt(control.value) > 12 || parseInt(control.value) < 1
        ? { invalidBirthdateMonth: true }
        : null;
    };
  }

  birthdateYearValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }
      return parseInt(control.value) > this.currentYear ||
        parseInt(control.value) < 1900
        ? { invalidBirthdateYear: true }
        : null;
    };
  }

  createUser(): void {
    this.didServerCreatUserFail = false;
    this.usernameAlreadyTaken = false;

    let birthdate = new Date();
    birthdate.setDate(this.createForm.value.birthdateDay);
    birthdate.setMonth(this.createForm.value.birthdateMonth);
    birthdate.setFullYear(this.createForm.value.birthdateYear);

    this.createRequest = {
      username: this.createForm.value.username,
      password: this.createForm.value.password,
      role: Roles.WORKER,
      details: {
        email: this.createForm.value.email,
        name: this.createForm.value.firstName,
        surname: this.createForm.value.lastName,
        birthdate: birthdate,
        birthplace: this.createForm.value.birthplace,
        cellphone: this.createForm.value.phoneNumber,
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
