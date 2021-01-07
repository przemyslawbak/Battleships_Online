import { Component, OnInit } from '@angular/core';

import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-game-menu',
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.css'],
})
export class GameMenuComponent {
  constructor(public auth: AuthService) {}
}
