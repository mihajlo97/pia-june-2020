import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { Farmer } from 'src/app/models/users';
import {
  SendWorkerRegistrationRequest,
  SendWorkerRegistrationResponse,
} from 'src/app/models/registration';
import { RegistrationService } from 'src/app/services/registration.service';
import { RecaptchaComponent } from 'ng-recaptcha';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-worker-register',
  templateUrl: './worker-register.component.html',
  styleUrls: ['./worker-register.component.css'],
})
export class WorkerRegisterComponent implements OnInit {
  @ViewChild('recaptchaRef') captchaRef: RecaptchaComponent;

  //form submission
  captchaToken = '';
  user: Farmer;
  regRequest: SendWorkerRegistrationRequest = {
    user: null,
    token: this.captchaToken,
  };
  responseSubscriber: Subscription;

  //on server response
  failedAuthRecaptcha = false;
  formSubmitSuccess = false;
  formSubmitted = false;
  takenUsername = '';
  isUniqueUsername = true;

  //form controls
  regForm: FormGroup;
  controlFirstName: AbstractControl;
  controlLastName: AbstractControl;
  controlUsername: AbstractControl;
  controlPassword: AbstractControl;
  controlPasswordConfirm: AbstractControl;
  controlBirthdateDay: AbstractControl;
  controlBirthdateMonth: AbstractControl;
  controlBirthdateYear: AbstractControl;
  controlBirthplace: AbstractControl;
  controlPhoneNumber: AbstractControl;
  controlEmail: AbstractControl;

  //validation failure flags
  isInvalidLastName = false;
  isInvalidFirstName = false;
  isInvalidUsername = false;
  isInvalidPassword = false;
  isInvalidPasswordConfirm = false;
  isInvalidBirthdateDay = false;
  isInvalidBirthdateMonth = false;
  isInvalidBirthdateYear = false;
  isInvalidBirthplace = false;
  isInvalidPhoneNumber = false;
  isInvalidEmail = false;

  //validation success flags
  validLastName: boolean;
  validFirstName: boolean;
  validUsername: boolean;
  validPassword: boolean;
  validPasswordConfirm: boolean;
  validBirthdateDay: boolean;
  validBirthdateMonth: boolean;
  validBirthdateYear: boolean;
  validBirthplace: boolean;
  validPhoneNumber: boolean;
  validEmail: boolean;

  //regex validators
  passwordRegex: RegExp;
  passwordRegexAlt: RegExp;
  usernameRegex: RegExp;
  phoneNumberRegex: RegExp;

  //auxillary vars
  currentYear = new Date().getFullYear();
  month: number;
  year: number;

  constructor(
    private fb: FormBuilder,
    private registration: RegistrationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.phoneNumberRegex = new RegExp(
      '^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]{9,20}$'
    );
    this.passwordRegex = new RegExp(
      '^[a-z](?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$'
    );
    this.passwordRegexAlt = new RegExp(
      '^[A-Z](?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$'
    );
    this.usernameRegex = new RegExp('^[a-zA-Z0-9_]{6,50}$');

    this.regForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: [
        '',
        Validators.compose([Validators.required, this.usernameValidator()]),
      ],
      password: [
        '',
        Validators.compose([Validators.required, this.passwordValidator()]),
      ],
      passwordConfirm: [
        '',
        Validators.compose([
          Validators.required,
          this.passwordConfirmValidator(),
        ]),
      ],
      birthDateDay: [
        '25',
        Validators.compose([Validators.required, this.birthdateDayValidator()]),
      ],
      birthDateMonth: [
        '5',
        Validators.compose([
          Validators.required,
          this.birthdayMonthValidator(),
        ]),
      ],
      birthDateYear: [
        this.currentYear,
        Validators.compose([
          Validators.required,
          this.birthdateYearValidator(),
        ]),
      ],
      birthPlace: ['', Validators.required],
      phoneNumber: ['', Validators.pattern(this.phoneNumberRegex)],
      email: ['', [Validators.required, Validators.email]],
      recaptcha: ['', Validators.required],
    });

    this.month = parseInt(this.regForm.get('birthDateMonth').value);
    this.year = parseInt(this.regForm.get('birthDateYear').value);

    this.bindValidationFlags();
  }

  ngOnInit(): void {}

  bindValidationFlags() {
    //first name field
    this.controlFirstName = this.regForm.get('firstName');
    this.controlFirstName.valueChanges.subscribe(() => {
      if (!this.controlFirstName.valid) {
        this.isInvalidFirstName = true;
        this.validFirstName = false;
      } else {
        this.isInvalidFirstName = false;
        this.validFirstName = true;
      }
    });

    //last name field
    this.controlLastName = this.regForm.get('lastName');
    this.controlLastName.valueChanges.subscribe(() => {
      if (!this.controlLastName.valid) {
        this.isInvalidLastName = true;
        this.validLastName = false;
      } else {
        this.isInvalidLastName = false;
        this.validLastName = true;
      }
    });

    //username field
    this.controlUsername = this.regForm.get('username');
    this.controlUsername.valueChanges.subscribe(() => {
      if (!this.controlUsername.valid) {
        this.isInvalidUsername = true;
        this.validUsername = false;
      } else {
        this.isInvalidUsername = false;
        this.validUsername = true;
      }
    });

    //password field
    this.controlPassword = this.regForm.get('password');
    this.controlPassword.valueChanges.subscribe(() => {
      if (!this.controlPassword.valid) {
        this.isInvalidPassword = true;
        this.validPassword = false;
      } else {
        this.isInvalidPassword = false;
        this.validPassword = true;
      }
    });

    //password confirm field
    this.controlPasswordConfirm = this.regForm.get('passwordConfirm');
    this.controlPasswordConfirm.valueChanges.subscribe(() => {
      if (!this.controlPasswordConfirm.valid) {
        this.isInvalidPasswordConfirm = true;
        this.validPasswordConfirm = false;
      } else {
        this.isInvalidPasswordConfirm = false;
        this.validPasswordConfirm = true;
      }
    });

    //birthdate fields
    this.controlBirthdateDay = this.regForm.get('birthDateDay');
    this.controlBirthdateDay.valueChanges.subscribe(() => {
      if (!this.controlBirthdateDay.valid) {
        this.isInvalidBirthdateDay = true;
        this.validBirthdateDay = false;
      } else {
        this.isInvalidBirthdateDay = false;
        this.validBirthdateDay = true;
      }
    });
    this.controlBirthdateMonth = this.regForm.get('birthDateMonth');
    this.controlBirthdateMonth.valueChanges.subscribe(() => {
      this.forceBirthdateDayValidation();
      if (!this.controlBirthdateMonth.valid) {
        this.isInvalidBirthdateMonth = true;
        this.validBirthdateMonth = false;
      } else {
        this.isInvalidBirthdateMonth = false;
        this.validBirthdateMonth = true;
      }
    });
    this.controlBirthdateYear = this.regForm.get('birthDateYear');
    this.controlBirthdateYear.valueChanges.subscribe(() => {
      this.forceBirthdateDayValidation();
      if (!this.controlBirthdateYear.valid) {
        this.isInvalidBirthdateYear = true;
        this.validBirthdateYear = false;
      } else {
        this.isInvalidBirthdateYear = false;
        this.validBirthdateYear = true;
      }
    });

    //birthplace field
    this.controlBirthplace = this.regForm.get('birthPlace');
    this.controlBirthplace.valueChanges.subscribe(() => {
      if (!this.controlBirthplace.valid) {
        this.isInvalidBirthplace = true;
        this.validBirthplace = false;
      } else {
        this.isInvalidBirthplace = false;
        this.validBirthplace = true;
      }
    });

    //phone number field
    this.controlPhoneNumber = this.regForm.get('phoneNumber');
    this.controlPhoneNumber.valueChanges.subscribe(() => {
      if (!this.controlPhoneNumber.valid) {
        this.isInvalidPhoneNumber = true;
        this.validPhoneNumber = false;
      } else {
        this.isInvalidPhoneNumber = false;
        this.validPhoneNumber = true;
      }
    });

    //email field
    this.controlEmail = this.regForm.get('email');
    this.controlEmail.valueChanges.subscribe(() => {
      if (!this.controlEmail.valid) {
        this.isInvalidEmail = true;
        this.validEmail = false;
      } else {
        this.isInvalidEmail = false;
        this.validEmail = true;
      }
    });
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const value = control.value;
      if (!value) {
        return null;
      }
      return this.passwordRegex.test(value) || this.passwordRegexAlt.test(value)
        ? null
        : { invalidPassword: true };
    };
  }

  passwordConfirmValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const value = control.value;
      if (!value) {
        return null;
      }
      return this.controlPassword.valid && this.controlPassword.value === value
        ? null
        : { invalidPasswordConfirm: true };
    };
  }

  usernameValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }
      return this.usernameRegex.test(control.value)
        ? null
        : { invalidUsername: true };
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

      if (this.month === 2) {
        let isLeapYear =
          (this.year % 4 == 0 && this.year % 100 != 0) || this.year % 400 == 0;
        if (isLeapYear && day > 29) {
          return { invalidBirthdateDay: true };
        } else if (!isLeapYear && day > 28) {
          return { invalidBirthdateDay: true };
        }
      } else {
        if (day > 30 && [4, 6, 9, 11].lastIndexOf(this.month) > -1) {
          return { invalidBirthdateDay: true };
        }
      }

      return null;
    };
  }

  birthdayMonthValidator(): ValidatorFn {
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

  forceBirthdateDayValidation(): void {
    this.month = parseInt(this.regForm.get('birthDateMonth').value);
    this.year = parseInt(this.regForm.get('birthDateYear').value);
    this.regForm
      .get('birthDateDay')
      .setValue(this.regForm.get('birthDateDay').value + 1);
    this.regForm
      .get('birthDateDay')
      .setValue(this.regForm.get('birthDateDay').value - 1);
  }

  resolveCaptcha(response: string) {
    this.captchaToken = response == null ? '' : response;
    this.failedAuthRecaptcha = response == null;
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.formSubmitSuccess = true;

    let userBirthdate = new Date();
    userBirthdate.setDate(this.regForm.value.birthDateDay);
    userBirthdate.setMonth(this.regForm.value.birthDateMonth);
    userBirthdate.setFullYear(this.regForm.value.birthDateYear);
    this.takenUsername = this.regForm.value.username;

    //form request body
    this.regRequest.user = {
      name: this.regForm.value.firstName.trim(),
      surname: this.regForm.value.lastName.trim(),
      username: this.regForm.value.username,
      password: this.regForm.value.password,
      birthdate: userBirthdate,
      birthplace: this.regForm.value.birthPlace.trim(),
      cellphone: this.regForm.value.phoneNumber,
      email: this.regForm.value.email,
    };
    this.regRequest.token = this.captchaToken;

    //API call
    this.responseSubscriber = this.registration
      .sendWorkerRegistrationRequest(this.regRequest)
      .subscribe((res: SendWorkerRegistrationResponse) => {
        if (res.success) {
          this.router.navigate(['../success'], { relativeTo: this.route });
        }

        if (res.captchaOK === false) {
          this.captchaRef.reset();
          this.failedAuthRecaptcha = true;
        }
        this.isUniqueUsername = res.usernameOK;
        this.formSubmitSuccess = res.success;
      });
  }

  ngOnDestroy(): void {
    if (this.responseSubscriber) {
      this.responseSubscriber.unsubscribe();
    }
  }
}
