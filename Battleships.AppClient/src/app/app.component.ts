import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Battleships';
  private subscription: Subscription;
  constructor(private router: Router, private auth: AuthService) {
    this.subscription = router.events.subscribe((event) => {
      if (event instanceof NavigationStart && !router.navigated) {
        auth.refreshToken();
      }
    });
  }
}
