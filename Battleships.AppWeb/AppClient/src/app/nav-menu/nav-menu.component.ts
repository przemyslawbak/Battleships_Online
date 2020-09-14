import { Component } from '@angular/core';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
  userName: string;
  constructor(public auth: AuthService) {

  }

  isExpanded = false;

  getUserDisplayName() {
    if (this.auth.isLoggedIn()) {
      return this.auth.getAuth()!.displayName;
    } else {
      return "guest";
    }
  }

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  logout(): boolean {
    // logs out the user, then redirects him to Home View.
    if (this.auth.logout()) {
      console.log('logout clicked');
    }
    return false;
  }
}
