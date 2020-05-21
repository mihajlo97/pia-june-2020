import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AdminService } from 'src/app/services/users/admin.service';
import {
  UserItem,
  UserSearchPartialRequest,
  SelectUsersByRoleRequest,
  DeleteUserResponse,
} from 'src/app/models/admin';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { Roles } from 'src/app/models/users';

//use jQuery
declare var $: any;

@Component({
  selector: 'app-admin-manage',
  templateUrl: './admin-manage.component.html',
  styleUrls: ['./admin-manage.component.css'],
})
export class AdminManageComponent implements OnInit {
  //load users
  usersStream$: Observable<UserItem[]>;
  usersStreamSubscription: Subscription;

  //search users
  searchSubscription: Subscription;
  searchRequest: UserSearchPartialRequest = {
    partial: '',
    role: Roles.NONE,
  };
  searchForm: FormGroup;
  readonly MINIMUM_CHARS = 2;

  //role filtering
  selectedRoles: boolean[] = [true, false, false, false];
  selectByRoleRequest: SelectUsersByRoleRequest = {
    role: Roles.NONE,
  };
  roleSelector: Roles[] = [Roles.ADMIN, Roles.WORKER, Roles.COMPANY];
  activeRole: Roles = Roles.NONE;
  readonly NO_ROLE: Roles = Roles.NONE;

  //delete account
  readyToDelete: UserItem = {
    username: '',
    role: Roles.NONE,
  };
  deleteUserSubscription: Subscription;
  didDeleteUserFail: boolean = false;

  constructor(private admin: AdminService, private fb: FormBuilder) {
    this.searchForm = fb.group({
      search: [''],
    });
  }

  ngOnInit(): void {
    this.usersStream$ = this.admin.getAllUsers();
    this.usersStreamSubscription = this.usersStream$.subscribe();
    this.setSearchUsersSubscription();
  }

  setSearchUsersSubscription(): void {
    this.searchSubscription = this.searchForm
      .get('search')
      .valueChanges.pipe(debounceTime(500))
      .subscribe((partial: string) => {
        if (partial.length >= this.MINIMUM_CHARS) {
          this.searchRequest.partial = partial;
          this.usersStream$ = this.admin.searchUsers(this.searchRequest);
        } else if (partial === '' && !this.searchForm.pristine) {
          this.getUsersByRole(this.activeRole);
        }
      });
  }

  getUsersByRole(role: Roles): void {
    this.selectByRoleRequest.role = role;
    this.searchRequest.role = role;
    this.activeRole = role;
    this.selectedRoles.forEach((value, index, array) => (array[index] = false));
    /*if (this.searchForm.get('search').value !== '') {
      this.searchForm.get('search').setValue('');
    }*/
    switch (role) {
      case Roles.ADMIN: {
        if (this.selectedRoles[1]) return;
        this.selectedRoles[1] = true;
        this.usersStream$ = this.admin.getUsersByRole(this.selectByRoleRequest);
        break;
      }
      case Roles.WORKER: {
        if (this.selectedRoles[2]) return;
        this.selectedRoles[2] = true;
        this.usersStream$ = this.admin.getUsersByRole(this.selectByRoleRequest);
        break;
      }
      case Roles.COMPANY: {
        if (this.selectedRoles[3]) return;
        this.selectedRoles[3] = true;
        this.usersStream$ = this.admin.getUsersByRole(this.selectByRoleRequest);
        break;
      }
      case Roles.NONE: {
        if (this.selectedRoles[0]) return;
        this.selectedRoles[0] = true;
        this.usersStream$ = this.admin.getAllUsers();
      }
    }
  }

  editAccount(username: string, role: Roles): void {}

  markUserToDelete(username: string, role: Roles): void {
    this.readyToDelete.role = role;
    this.readyToDelete.username = username;
    this.didDeleteUserFail = false;
  }

  confirmDeleteMarkedUser(): void {
    this.deleteUserSubscription = this.admin
      .deleteUser(this.readyToDelete)
      .subscribe((res: DeleteUserResponse) => {
        if (res.deleteSuccess) {
          $('#deleteAccountModal').modal('hide');
          this.getUsersByRole(this.activeRole);
        } else {
          this.didDeleteUserFail = true;
        }
      });
  }

  ngOnDestroy(): void {
    this.usersStreamSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
    this.deleteUserSubscription.unsubscribe();
  }
}
