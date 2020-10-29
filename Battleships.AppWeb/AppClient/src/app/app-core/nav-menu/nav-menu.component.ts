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

  public isExpanded = false;

  public getUserDisplayName() {
    if (this.auth.isLoggedIn()) {
      return this.auth.getAuth().displayName ?? 'logged in user';
    } else {
      return 'guest';
    }
  }

  public collapse() {
    this.isExpanded = false;
  }

  public toggle() {
    this.isExpanded = !this.isExpanded;
  }

  public logout(): boolean {
    const result = this.auth.logout();
    console.log(result);
    return result;
  }
}
