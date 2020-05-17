import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-change-password-success',
  templateUrl: './change-password-success.component.html',
  styleUrls: ['./change-password-success.component.css'],
})
export class ChangePasswordSuccessComponent implements OnInit {
  constructor(private auth: AuthenticationService, private router: Router) {}

  ngOnInit(): void {
    this.auth
      .attemptUserLogout()
      .then((success: boolean) => {
        if (success) {
          setTimeout(() => {
            this.router.navigate(['login']);
          }, 4000);
        }
      })
      .catch((err: HttpErrorResponse) => {
        if (err.status === 500) {
          console.error(
            'Authentication-Exception: Failed to log out the user.',
            err
          );
        }
      });
  }
}
