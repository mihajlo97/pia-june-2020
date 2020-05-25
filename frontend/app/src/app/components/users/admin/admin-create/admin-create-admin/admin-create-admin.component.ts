import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { AdminService } from 'src/app/services/users/admin.service';
import { CreateUserRequest, CreateUserResponse } from 'src/app/models/admin';
import { Roles } from 'src/app/models/users';

//use jQuery
declare var $: any;

@Component({
  selector: 'app-admin-create-admin',
  templateUrl: './admin-create-admin.component.html',
  styleUrls: ['./admin-create-admin.component.css'],
})
export class AdminCreateAdminComponent implements OnInit {
  createForm: FormGroup;
  createRequest: CreateUserRequest;

  //validation
  usernameRegex: RegExp;
  passwordRegex: RegExp;
  passwordRegexAlt: RegExp;

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

  createUser(): void {
    this.didServerCreatUserFail = false;
    this.usernameAlreadyTaken = false;

    this.createRequest = {
      username: this.createForm.value.username,
      password: this.createForm.value.password,
      role: Roles.ADMIN,
      details: {
        email: this.createForm.value.email,
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
