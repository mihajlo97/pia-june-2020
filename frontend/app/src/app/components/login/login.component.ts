import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showErrorMsg = false;

  constructor(private fb: FormBuilder, private router: Router) {
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

  sendLoginRequest() {
    return false;
  }
}
