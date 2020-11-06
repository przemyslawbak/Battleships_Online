import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css'],
})
export class NavMenuComponent {
  public userName: string;
  constructor(
    public auth: AuthService,
    private game: GameService,
    private router: Router
  ) {}

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
