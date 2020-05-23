import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AdminService } from 'src/app/services/users/admin.service';
import {
  UserItem,
  UserSearchPartialRequest,
  SelectUsersByRoleRequest,
  DeleteUserResponse,
} from 'src/app/models/admin';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { Roles, UserDetails } from 'src/app/models/users';

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

  //delete user
  markedUserToDelete: UserItem = {
    username: '',
    role: Roles.NONE,
  };
  deleteUserSubscription: Subscription;
  didDeleteUserFail: boolean = false;

  //edit user
  markedUserToEdit: UserItem = {
    username: '',
    role: Roles.NONE,
  };
  editUserSubscription: Subscription;
  editUserModalPristine: boolean = true;
  userDetails: UserDetails;
  editForm: FormGroup;
  didEditUserLoadFail: boolean = false;
  didEditUserSubmitFail: boolean = false;
  readonly currentYear = new Date().getFullYear();

  constructor(private admin: AdminService, private fb: FormBuilder) {
    this.searchForm = fb.group({
      search: [''],
    });
    this.editForm = this.fb.group({
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthdateDay: ['', Validators.required],
      birthdateMonth: ['', Validators.required],
      birthdateYear: ['', Validators.required],
      birthplace: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      name: ['', Validators.required],
      foundingDay: ['', Validators.required],
      foundingMonth: ['', Validators.required],
      foundingYear: ['', Validators.required],
      hq: ['', Validators.required],
    });
    this.usersStream$ = this.admin.getAllUsers();
    this.usersStreamSubscription = this.usersStream$.subscribe();
    this.setSearchUsersSubscription();
  }

  ngOnInit(): void {}

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

  markUserToEdit(username: string, role: Roles): void {
    this.editUserModalPristine = false;
    this.didEditUserLoadFail = false;
    this.markedUserToEdit.role = role;
    this.markedUserToEdit.username = username;

    this.editUserSubscription = this.admin
      .getUserDetails(this.markedUserToEdit)
      .subscribe((res: UserDetails) => {
        if (res.email === '') {
          this.didEditUserLoadFail = true;
          return;
        }
        console.log('[DEBUG]: Response: ', res);
        switch (role) {
          case Roles.ADMIN: {
            this.editForm.setValue({
              username: username,
              email: res.email,
              firstName: '',
              lastName: '',
              birthdateDay: '',
              birthdateMonth: '',
              birthdateYear: '',
              birthplace: '',
              phoneNumber: '',
              name: '',
              foundingDay: '',
              foundingMonth: '',
              foundingYear: '',
              hq: '',
            });
            break;
          }
          case Roles.WORKER: {
            const birthdate = new Date(res.birthdate);
            this.editForm.setValue({
              username: username,
              email: res.email,
              firstName: res.name,
              lastName: res.surname,
              birthdateDay: birthdate.getDate(),
              birthdateMonth: birthdate.getMonth(),
              birthdateYear: birthdate.getFullYear(),
              birthplace: res.birthplace,
              phoneNumber: res.cellphone,
              name: '',
              foundingDay: '',
              foundingMonth: '',
              foundingYear: '',
              hq: '',
            });
            break;
          }
          case Roles.COMPANY: {
            const foundingDate = new Date(res.foundingDate);
            this.editForm.setValue({
              username: username,
              email: res.email,
              name: res.name,
              foundingDay: foundingDate.getDate(),
              foundingMonth: foundingDate.getMonth(),
              foundingYear: foundingDate.getFullYear(),
              hq: res.hq,
              firstName: '',
              lastName: '',
              birthdateDay: '',
              birthdateMonth: '',
              birthdateYear: '',
              birthplace: '',
              phoneNumber: '',
            });
            break;
          }
        }
      });
  }

  markUserToDelete(username: string, role: Roles): void {
    this.markedUserToDelete.role = role;
    this.markedUserToDelete.username = username;
    this.didDeleteUserFail = false;
  }

  confirmEditMarkedUser(): void {}

  confirmDeleteMarkedUser(): void {
    this.deleteUserSubscription = this.admin
      .deleteUser(this.markedUserToDelete)
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
    if (this.deleteUserSubscription) {
      this.deleteUserSubscription.unsubscribe();
    }
    if (this.editUserSubscription) {
      this.editUserSubscription.unsubscribe();
    }
  }
}
