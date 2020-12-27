import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rules',
  templateUrl: './game-rules.component.html',
  styleUrls: ['./game-rules.component.css'],
})
export class GameRulesComponent {
  constructor(private router: Router) {}

  public onBack() {
    this.router.navigate(['']);
  }
}
