import { Component } from '@angular/core';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
  public userName: string;
  constructor(public auth: AuthService) { }

  public isExpanded = false;

  public getUserDisplayName() {
    if (this.auth.isLoggedIn()) {
      return this.auth.getAuth()!.displayName;
    } else {
      return "guest";
    }
  }

  public collapse() {
    this.isExpanded = false;
  }

  public toggle() {
    this.isExpanded = !this.isExpanded;
  }

  public logout(): boolean {
    let result = this.auth.logout();
    console.log(result);
    return result;
  }
}
