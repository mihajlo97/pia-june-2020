import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  username: string;
  constructor(private auth: AuthenticationService) {
    this.username = auth.getLoggedInUser();
  }

  ngOnInit(): void {}
}
