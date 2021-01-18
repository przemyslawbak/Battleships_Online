import { Component } from '@angular/core';

import { AuthService } from '@services/auth.service';
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
    private signalRService: SignalRService
  ) {}

  public getUserDisplayName(): string {
    if (this.auth.isLoggedIn()) {
      return this.auth.getAuth().displayName ?? 'logged in user';
    } else {
      return 'guest';
    }
  }

  public async logout(): Promise<void> {
    await this.signalRService.stopConnection();
    this.auth.logout();
  }
}
