import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { Roles } from '../models/users';
import { UserLoggedInResponse } from '../models/authetication';

@Injectable({
  providedIn: 'root',
})
export class WorkerAuthGuard implements CanActivate, CanActivateChild {
  constructor(private auth: AuthenticationService, private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    let response: UserLoggedInResponse;

    const checkRole = async () => {
      response = await this.auth.checkUserLoggedIn();
      if (response.role !== Roles.WORKER) {
        this.router.navigate(['forbidden']);
      }
      return response.role === Roles.WORKER;
    };
    return checkRole();
  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.canActivate(next, state);
  }
}
