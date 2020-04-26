import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showErrorMsg = false;
  showNewPass = false;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      user: ['', Validators.required],
      pass: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    console.warn(this.loginForm.value);
    if (this.sendLoginRequest() === false) {
      this.showErrorMsg = true;
      this.loginForm.reset();
    }
  }

  showNewPasswordFields(): void {
    this.showNewPass = true;
    this.loginForm.addControl('newPass', new FormControl(''));
    this.loginForm.addControl('newPassConfirm', new FormControl(''));
  }

  sendLoginRequest() {
    return false;
  }
}
