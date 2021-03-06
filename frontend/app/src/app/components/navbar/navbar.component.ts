import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NavbarOptions } from 'src/app/models/navbar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  navbarOptions: NavbarOptions = {
    loggedInUser: '',
    userRole: '',
  };
  showGuestMenu = true;

  username: string;
  constructor(private router: Router, private auth: AuthenticationService) {
    auth.navbarOption$.subscribe((options) => {
      this.navbarOptions = options;
      this.showGuestMenu = this.navbarOptions.loggedInUser === '';
    });
  }

  ngOnInit(): void {}

  logoutUser(): void {
    this.auth.attemptUserLogout().then((success) => {
      if (success) {
        this.router.navigate(['login']);
      } else {
        alert('Server failed to log out the user, please try again.');
      }
    });
  }

  changePassword(): void {
    this.router.navigate([`${this.auth.getUserRole()}/change-password`]);
  }

  navigateToDashboard(): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`${this.auth.getUserRole()}/dashboard/home`]);
    });
  }

  navigateToLogin(): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['login']);
    });
  }

  navigateToRegister(): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['register']);
    });
  }
}
