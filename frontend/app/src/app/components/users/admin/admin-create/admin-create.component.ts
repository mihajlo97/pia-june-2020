import { Component, OnInit } from '@angular/core';
import { Roles } from 'src/app/models/users';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminService } from 'src/app/services/users/admin.service';

@Component({
  selector: 'app-admin-create',
  templateUrl: './admin-create.component.html',
  styleUrls: ['./admin-create.component.css'],
})
export class AdminCreateComponent implements OnInit {
  //display selected component
  selectedRoles: boolean[] = [true, false, false];
  roleSelector: Roles[] = [Roles.WORKER, Roles.COMPANY, Roles.ADMIN];

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.navigate(['worker'], { relativeTo: this.route });
  }

  ngOnInit(): void {}

  loadCreateForm(role: Roles) {
    switch (role) {
      case Roles.WORKER: {
        this.selectedRoles = [true, false, false];
        this.router.navigate(['worker'], { relativeTo: this.route });
        break;
      }
      case Roles.COMPANY: {
        this.selectedRoles = [false, true, false];
        this.router.navigate(['company'], { relativeTo: this.route });
        break;
      }
      case Roles.ADMIN: {
        this.selectedRoles = [false, false, true];
        this.router.navigate(['admin'], { relativeTo: this.route });
        break;
      }
    }
  }
}
