import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from 'src/app/models/authetication';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent implements OnInit {
  //server request
  changePassRequest: ChangePasswordRequest = {
    oldPassword: '',
    newPassword: '',
  };

  //server error response flags
  hasServerErrorOccurred: boolean = false;
  incorrectCurrentPassword: boolean = false;

  //form setup
  form: FormGroup;
  controlPassword: AbstractControl;
  controlNewPassword: AbstractControl;
  controlNewPasswordConfirm: AbstractControl;
  passwordRegex: RegExp;
  passwordRegexAlt: RegExp;

  //view reactive validation flags
  isValidNewPassword: boolean = false;
  isInvalidNewPassword: boolean = false;
  isValidConfirmNewPassword: boolean = false;
  isInvalidConfirmNewPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthenticationService
  ) {
    this.passwordRegex = new RegExp(
      '^[a-z](?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$'
    );
    this.passwordRegexAlt = new RegExp(
      '^[A-Z](?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$'
    );

    this.form = fb.group({
      currentPassword: ['', Validators.required],
      newPassword: [
        '',
        Validators.compose([Validators.required, this.newPasswordValidator()]),
      ],
      confirmNewPassword: [
        '',
        Validators.compose([
          Validators.required,
          this.newPasswordConfirmValidator(),
        ]),
      ],
    });

    this.controlPassword = this.form.get('currentPassword');
    this.controlNewPassword = this.form.get('newPassword');
    this.controlNewPasswordConfirm = this.form.get('confirmNewPassword');

    this.setupReactiveValidation();
  }

  setupReactiveValidation(): void {
    this.controlPassword.valueChanges.subscribe(() => {
      if (!this.controlNewPassword.pristine) {
        this.forceNewPasswordValidation();
      }
    });
    this.controlNewPassword.valueChanges.subscribe(() => {
      this.isValidNewPassword = this.controlNewPassword.valid;
      this.isInvalidNewPassword = this.controlNewPassword.invalid;
      if (!this.controlNewPasswordConfirm.pristine) {
        this.forceNewPasswordConfirmValidation();
      }
    });
    this.controlNewPasswordConfirm.valueChanges.subscribe(() => {
      this.isValidConfirmNewPassword = this.controlNewPasswordConfirm.valid;
      this.isInvalidConfirmNewPassword = this.controlNewPasswordConfirm.invalid;
    });
  }

  forceNewPasswordValidation(): void {
    const value = this.controlNewPassword.value;
    this.controlNewPassword.setValue(value + '*');
    this.controlNewPassword.setValue(value);
  }

  forceNewPasswordConfirmValidation(): void {
    const value = this.controlNewPasswordConfirm.value;
    this.controlNewPasswordConfirm.setValue(value + '*');
    this.controlNewPasswordConfirm.setValue(value);
  }

  newPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const value = control.value;
      if (!value) {
        return null;
      }
      return (this.passwordRegex.test(value) ||
        this.passwordRegexAlt.test(value)) &&
        this.controlPassword.value !== value
        ? null
        : { invalidNewPassword: true };
    };
  }

  newPasswordConfirmValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const value = control.value;
      if (!value) {
        return null;
      }
      return this.controlNewPassword.value === value
        ? null
        : { invalidNewConfirmPassword: true };
    };
  }

  ngOnInit(): void {}

  onSubmit(): void {
    this.hasServerErrorOccurred = false;
    this.incorrectCurrentPassword = false;

    this.changePassRequest = {
      oldPassword: this.controlPassword.value,
      newPassword: this.controlNewPasswordConfirm.value,
    };

    this.auth
      .changePassword(this.changePassRequest)
      .then((response: ChangePasswordResponse) => {
        if (response.oldPassMatch && response.changeSuccess) {
          this.router.navigate(['../change-password-success'], {
            relativeTo: this.route,
          });
        }
      })
      .catch((err: HttpErrorResponse) => {
        const response: ChangePasswordResponse = err.error;
        if (!response.oldPassMatch && err.status === 403) {
          this.incorrectCurrentPassword = true;
        } else if (!response.changeSuccess && err.status === 500) {
          this.hasServerErrorOccurred = true;
          console.error(
            'Authentication-Exception: An internal server error has occurred while processing a change password user request.\n',
            err
          );
        }
      });
  }
}
