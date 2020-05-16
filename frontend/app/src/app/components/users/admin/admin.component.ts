import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  username: string;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthenticationService
  ) {
    this.username = auth.getLoggedInUser();
  }

  ngOnInit(): void {}

  logout(): void {
    this.auth.attemptUserLogout().then((loggoutSuccess) => {
      if (loggoutSuccess) {
        this.router.navigate(['login']);
      }
    });
  }

  success(): void {
    this.router.navigate(['success'], { relativeTo: this.route });
  }
}
