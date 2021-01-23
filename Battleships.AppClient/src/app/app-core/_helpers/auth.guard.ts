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

  public async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const user = this.auth.getAuth();

    if (user) {
      if (!this.auth.isRoleCorrect(route, user.role)) {
        await this.router.navigate(['']).then(() => {
          return false;
        });
      }

      return true;
    } else {
      await this.router
        .navigate(['join-site'], {
          queryParams: { returnUrl: state.url },
        })
        .then(() => {
          return false;
        });
    }

    return false;
  }
}
