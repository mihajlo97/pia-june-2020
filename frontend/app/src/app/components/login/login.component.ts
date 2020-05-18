import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { UserLoginRequest } from 'src/app/models/authetication';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginRequest: UserLoginRequest = {
    username: '',
    password: '',
  };

  showErrorMsg = false;
  errorMessages = ['Username not found.', 'Wrong password.'];
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthenticationService
  ) {
    this.loginForm = this.fb.group({
      user: ['', Validators.required],
      pass: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    this.showErrorMsg = false;
    this.errorMsg = '';
    this.loginRequest = {
      username: this.loginForm.value.user,
      password: this.loginForm.value.pass,
    };

    this.auth.attemptUserLogin(this.loginRequest).then((loginResponse) => {
      if (!loginResponse.userOK) {
        this.errorMsg = this.errorMessages[0];
        this.showErrorMsg = true;
        return;
      }
      if (!loginResponse.passOK) {
        this.errorMsg = this.errorMessages[1];
        this.showErrorMsg = true;
        return;
      }
      if (loginResponse.role) {
        this.router.navigate([`${loginResponse.role}/dashboard`]);
      }
    });
  }
}
