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
      if (!this.auth.isRoleCorrect(route, user)) {
        this.router.navigate(['']).then(() => {
          return false;
        });
      }

      return true;
    }

    this.router
      .navigate(['join-site'], {
        queryParams: { returnUrl: state.url },
      })
      .then(() => {
        return false;
      });
  }
}
