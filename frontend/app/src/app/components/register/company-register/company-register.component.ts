import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { Company } from 'src/app/models/users';
import {
  SendCompanyRegistrationRequest,
  SendCompanyRegistrationResponse,
} from 'src/app/models/registration';
import { RegistrationService } from 'src/app/services/registration.service';
import { RecaptchaComponent } from 'ng-recaptcha';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-company-register',
  templateUrl: './company-register.component.html',
  styleUrls: ['./company-register.component.css'],
})
export class CompanyRegisterComponent implements OnInit {
  @ViewChild('recaptchaRef') captchaRef: RecaptchaComponent;

  //form submission
  regForm: FormGroup;
  captchaToken = '';
  user: Company;
  regRequest: SendCompanyRegistrationRequest = {
    user: null,
    token: this.captchaToken,
  };
  responseSubscriber: Subscription;

  //on server response
  failedAuthRecaptcha = false;
  formSubmitted = false;
  formSubmitSuccess = false;
  takenAlias = '';
  uniqueAlias = true;

  //form controls
  controlName: AbstractControl;
  controlAlias: AbstractControl;
  controlPass: AbstractControl;
  controlPassConfirm: AbstractControl;
  controlFoundingDay: AbstractControl;
  controlFoundingMonth: AbstractControl;
  controlFoundingYear: AbstractControl;
  controlHQ: AbstractControl;
  controlEmail: AbstractControl;

  //validation failure flags
  invalidName = false;
  invalidAlias = false;
  invalidPass = false;
  invalidPassConfirm = false;
  invalidFoundingDay = false;
  invalidFoundingMonth = false;
  invalidFoundingYear = false;
  invalidHQ = false;
  invalidEmail = false;

  //validation success flags
  validName: boolean;
  validAlias: boolean;
  validPass: boolean;
  validPassConfirm: boolean;
  validFoundingDay: boolean;
  validFoundingMonth: boolean;
  validFoundingYear: boolean;
  validHQ: boolean;
  validEmail: boolean;

  //regex validators
  passwordRegex: RegExp;
  passwordRegexAlt: RegExp;
  aliasRegex: RegExp;

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
    this.passwordRegex = new RegExp(
      '^[a-z](?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$'
    );
    this.passwordRegexAlt = new RegExp(
      '^[A-Z](?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$'
    );
    this.aliasRegex = new RegExp('^[a-zA-Z0-9., ]{2,50}$');

    this.regForm = this.fb.group({
      name: ['', Validators.required],
      alias: [
        '',
        Validators.compose([Validators.required, this.aliasValidator()]),
      ],
      pass: [
        '',
        Validators.compose([Validators.required, this.passwordValidator()]),
      ],
      passConfirm: [
        '',
        Validators.compose([
          Validators.required,
          this.passwordConfirmValidator(),
        ]),
      ],
      foundingDay: [
        '25',
        Validators.compose([Validators.required, this.foundingDayValidator()]),
      ],
      foundingMonth: [
        '5',
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
      email: ['', Validators.compose([Validators.required, Validators.email])],
      recaptcha: ['', Validators.required],
    });

    this.month = parseInt(this.regForm.get('foundingMonth').value);
    this.year = parseInt(this.regForm.get('foundingYear').value);

    this.bindValidationFlags();
  }

  ngOnInit(): void {}

  bindValidationFlags() {
    //company name field
    this.controlName = this.regForm.get('name');
    this.controlName.valueChanges.subscribe(() => {
      if (!this.controlName.valid) {
        this.invalidName = true;
        this.validName = false;
      } else {
        this.invalidName = false;
        this.validName = true;
      }
    });

    //company alias field
    this.controlAlias = this.regForm.get('alias');
    this.controlAlias.valueChanges.subscribe(() => {
      if (!this.controlAlias.valid) {
        this.invalidAlias = true;
        this.validAlias = false;
      } else {
        this.invalidAlias = false;
        this.validAlias = true;
      }
    });

    //password field
    this.controlPass = this.regForm.get('pass');
    this.controlPass.valueChanges.subscribe(() => {
      if (!this.controlPass.valid) {
        this.invalidPass = true;
        this.validPass = false;
      } else {
        this.invalidPass = false;
        this.validPass = true;
      }
    });

    //password confirm field
    this.controlPassConfirm = this.regForm.get('passConfirm');
    this.controlPassConfirm.valueChanges.subscribe(() => {
      if (!this.controlPassConfirm.valid) {
        this.invalidPassConfirm = true;
        this.validPassConfirm = false;
      } else {
        this.invalidPassConfirm = false;
        this.validPassConfirm = true;
      }
    });

    //founding date fields
    this.controlFoundingDay = this.regForm.get('foundingDay');
    this.controlFoundingDay.valueChanges.subscribe(() => {
      if (!this.controlFoundingDay.valid) {
        this.invalidFoundingDay = true;
        this.validFoundingDay = false;
      } else {
        this.invalidFoundingDay = false;
        this.validFoundingDay = true;
      }
    });
    this.controlFoundingMonth = this.regForm.get('foundingMonth');
    this.controlFoundingMonth.valueChanges.subscribe(() => {
      this.forceDateValidation();
      if (!this.controlFoundingMonth.valid) {
        this.invalidFoundingMonth = true;
        this.validFoundingMonth = false;
      } else {
        this.invalidFoundingMonth = false;
        this.validFoundingMonth = true;
      }
    });
    this.controlFoundingYear = this.regForm.get('foundingYear');
    this.controlFoundingYear.valueChanges.subscribe(() => {
      this.forceDateValidation();
      if (!this.controlFoundingYear.valid) {
        this.invalidFoundingYear = true;
        this.validFoundingYear = false;
      } else {
        this.invalidFoundingYear = false;
        this.validFoundingYear = true;
      }
    });

    //company hq field
    this.controlHQ = this.regForm.get('hq');
    this.controlHQ.valueChanges.subscribe(() => {
      if (!this.controlHQ.valid) {
        this.invalidHQ = true;
        this.validHQ = false;
      } else {
        this.invalidHQ = false;
        this.validHQ = true;
      }
    });

    //email field
    this.controlEmail = this.regForm.get('email');
    this.controlEmail.valueChanges.subscribe(() => {
      if (!this.controlEmail.valid) {
        this.invalidEmail = true;
        this.validEmail = false;
      } else {
        this.invalidEmail = false;
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
      return this.controlPass.valid && this.controlPass.value === value
        ? null
        : { invalidPasswordConfirm: true };
    };
  }

  aliasValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }
      return this.aliasRegex.test(control.value)
        ? null
        : { invalidUsername: true };
    };
  }

  foundingDayValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }

      let day = parseInt(control.value);
      if (day < 1 || day > 31) {
        return { invalidDay: true };
      }

      if (this.month === 2) {
        let isLeapYear =
          (this.year % 4 == 0 && this.year % 100 != 0) || this.year % 400 == 0;
        if (isLeapYear && day > 29) {
          return { invalidDay: true };
        } else if (!isLeapYear && day > 28) {
          return { invalidDay: true };
        }
      } else {
        if (day > 30 && [4, 6, 9, 11].lastIndexOf(this.month) > -1) {
          return { invalidDay: true };
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
        ? { invalidMonth: true }
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
        ? { invalidYear: true }
        : null;
    };
  }

  forceDateValidation(): void {
    this.month = parseInt(this.regForm.get('foundingMonth').value);
    this.year = parseInt(this.regForm.get('foundingYear').value);
    this.regForm
      .get('foundingDay')
      .setValue(this.regForm.get('foundingDay').value + 1);
    this.regForm
      .get('foundingDay')
      .setValue(this.regForm.get('foundingDay').value - 1);
  }

  resolveCaptcha(response: string) {
    this.captchaToken = response == null ? '' : response;
    this.failedAuthRecaptcha = response == null;
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.formSubmitSuccess = true;

    let companyFoundingDate = new Date();
    companyFoundingDate.setDate(this.regForm.value.foundingDay);
    companyFoundingDate.setMonth(this.regForm.value.foundingMonth);
    companyFoundingDate.setFullYear(this.regForm.value.foundingYear);
    this.takenAlias = this.regForm.value.alias;

    //form request body
    this.regRequest.user = {
      name: this.regForm.value.name.trim(),
      alias: this.regForm.value.alias.trim(),
      pass: this.regForm.value.pass,
      foundingDate: companyFoundingDate,
      hq: this.regForm.value.hq.trim(),
      email: this.regForm.value.email,
    };
    this.regRequest.token = this.captchaToken;

    //API call
    this.responseSubscriber = this.registration
      .sendCompanyRegistrationRequest(this.regRequest)
      .subscribe((res: SendCompanyRegistrationResponse) => {
        if (res.success) {
          this.router.navigate(['../success'], { relativeTo: this.route });
        }

        if (res.captchaOK === false) {
          this.captchaRef.reset();
          this.failedAuthRecaptcha = true;
        }
        this.uniqueAlias = res.aliasOK;
        this.formSubmitSuccess = res.success;
      });
  }

  ngOnDestroy(): void {
    if (this.responseSubscriber) {
      this.responseSubscriber.unsubscribe();
    }
  }
}
