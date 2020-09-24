import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

import { AuthService } from '@services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const user = this.auth.getAuth();

    if (user) {
      if (route.data.roles && route.data.roles.indexOf(user.role) === -1) {
        this.router.navigate(['']);
        return false;
      }

      return true;
    }

    this.router.navigate(['join'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
