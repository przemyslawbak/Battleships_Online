import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@services/game.service';

@Component({
  templateUrl: './game-play.component.html',
  styleUrls: ['./game-play.component.css'],
})
export class GamePlayComponent implements OnInit {
  constructor(private router: Router, private game: GameService) {}

  public ngOnInit(): void {
    console.log(this.game.getGame());
    if (!this.game.getGame()) {
      this.router.navigate(['start']);
    } else {
      //todo: continue game with current game state
    }
  }

  public onBack() {
    this.router.navigate(['']);
  }
}
