import { Component } from '@angular/core';

import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css'],
})
export class NavMenuComponent {
  public userName: string;
  constructor(public auth: AuthService) {}

  public getUserDisplayName() {
    if (this.auth.isLoggedIn()) {
      return this.auth.getAuth().displayName ?? 'logged in user';
    } else {
      return 'guest';
    }
  }

  public logout(): boolean {
    const result = this.auth.logout();
    console.log(result);
    return result;
  }
}
