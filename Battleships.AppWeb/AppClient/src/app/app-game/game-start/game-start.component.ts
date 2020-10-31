import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Component({
  templateUrl: './game-start.component.html',
  styleUrls: ['./game-start.component.css'],
})
export class GameStartComponent {
  constructor(private router: Router, private auth: AuthService) {}

  public ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['join']);
    }
  }
}
