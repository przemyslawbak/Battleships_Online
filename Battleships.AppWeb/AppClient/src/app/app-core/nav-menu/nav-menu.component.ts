import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';
import { SignalRService } from '@services/signal-r.service';

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
    private router: Router,
    private signalRService: SignalRService
  ) {}

  public getUserDisplayName() {
    if (this.auth.isLoggedIn()) {
      return this.auth.getAuth().displayName ?? 'logged in user';
    } else {
      return 'guest';
    }
  }

  public logout(): boolean {
    this.signalRService.stopConnection();
    const result = this.auth.logout();
    console.log(result);
    return result;
  }
}
