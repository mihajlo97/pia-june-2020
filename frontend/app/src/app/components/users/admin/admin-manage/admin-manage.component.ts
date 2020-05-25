import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AdminService } from 'src/app/services/users/admin.service';
import {
  UserItem,
  UserSearchPartialRequest,
  SelectUsersByRoleRequest,
  DeleteUserResponse,
  EditUserRequest,
  EditUserResponse,
} from 'src/app/models/admin';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
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
  userDetails: UserDetails;
  editForm: FormGroup;
  didEditUserLoadFail: boolean = false;
  didEditUserSubmitFail: boolean = false;
  editUserModalPristine: boolean = true;
  readonly currentYear = new Date().getFullYear();

  constructor(private admin: AdminService, private fb: FormBuilder) {
    this.searchForm = fb.group({
      search: [''],
    });
    this.editForm = this.fb.group({
      username: ['', Validators.required],
      firstName: ['', this.applyRoleBasedValidation(Roles.WORKER)],
      lastName: ['', this.applyRoleBasedValidation(Roles.WORKER)],
      birthdateDay: ['', this.applyRoleBasedValidation(Roles.WORKER)],
      birthdateMonth: ['', this.applyRoleBasedValidation(Roles.WORKER)],
      birthdateYear: ['', this.applyRoleBasedValidation(Roles.WORKER)],
      birthplace: ['', this.applyRoleBasedValidation(Roles.WORKER)],
      phoneNumber: ['', this.applyRoleBasedValidation(Roles.WORKER)],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      name: ['', this.applyRoleBasedValidation(Roles.COMPANY)],
      foundingDay: ['', this.applyRoleBasedValidation(Roles.COMPANY)],
      foundingMonth: ['', this.applyRoleBasedValidation(Roles.COMPANY)],
      foundingYear: ['', this.applyRoleBasedValidation(Roles.COMPANY)],
      hq: ['', this.applyRoleBasedValidation(Roles.COMPANY)],
    });
    this.usersStream$ = this.admin.getAllUsers();
    this.usersStreamSubscription = this.usersStream$.subscribe();
    this.setSearchUsersSubscription();
  }

  ngOnInit(): void {}

  applyRoleBasedValidation(role: Roles): ValidatorFn {
    switch (role) {
      case Roles.ADMIN: {
        return (control: AbstractControl): { [key: string]: any } => {
          if (!control) {
            return null;
          }

          if (this.markedUserToEdit.role === role) {
            return control.value === '' ? { invalidField: true } : null;
          }
          return null;
        };
      }
      case Roles.COMPANY: {
        return (control: AbstractControl): { [key: string]: any } => {
          if (!control) {
            return null;
          }

          if (this.markedUserToEdit.role === role) {
            return control.value === '' ? { invalidField: true } : null;
          }
          return null;
        };
      }
      case Roles.WORKER: {
        return (control: AbstractControl): { [key: string]: any } => {
          if (!control) {
            return null;
          }

          if (this.markedUserToEdit.role === role) {
            return control.value === '' ? { invalidField: true } : null;
          }
          return null;
        };
      }
    }
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

  confirmEditMarkedUser(): void {
    this.didEditUserSubmitFail = false;
    if (this.editForm.invalid) {
      return;
    }

    if (this.editForm.pristine) {
      return;
    }

    let req: EditUserRequest = {
      username: this.markedUserToEdit.username,
      role: this.markedUserToEdit.role,
      details: {
        email: this.editForm.value.email,
      },
    };

    const formValue = this.editForm.value;
    switch (this.markedUserToEdit.role) {
      case Roles.WORKER: {
        const birthdate = new Date();
        birthdate.setDate(formValue.birthdateDay);
        birthdate.setMonth(formValue.birthdateMonth);
        birthdate.setFullYear(formValue.birthdateYear);

        req.details.name = formValue.firstName;
        req.details.surname = formValue.lastName;
        req.details.cellphone = formValue.phoneNumber;
        req.details.birthplace = formValue.birthplace;
        req.details.birthdate = birthdate;
        break;
      }
      case Roles.COMPANY: {
        const founded = new Date();
        founded.setDate(formValue.foundingDay);
        founded.setMonth(formValue.foundingMonth);
        founded.setFullYear(formValue.foundingYear);

        req.details.name = formValue.name;
        req.details.foundingDate = founded;
        req.details.hq = formValue.hq;
        break;
      }
    }

    this.editUserSubscription = this.admin
      .editUser(req)
      .subscribe((res: EditUserResponse) => {
        if (res.editSuccess) {
          $('#editAccountModal').modal('hide');
        } else {
          this.didEditUserSubmitFail = true;
        }
      });
  }

  cancelEdit(): void {
    this.didEditUserSubmitFail = false;
    this.editForm.reset();
  }

  markUserToDelete(username: string, role: Roles): void {
    this.markedUserToDelete.role = role;
    this.markedUserToDelete.username = username;
    this.didDeleteUserFail = false;
  }

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
