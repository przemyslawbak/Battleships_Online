import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Component({
  templateUrl: './game-enter.component.html',
  styleUrls: ['./game-enter.component.css'],
})
export class GameEnterComponent {
  constructor(private router: Router, private auth: AuthService) {}
}
