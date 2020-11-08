import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@services/game.service';
import { GameStage } from '@models/game-state.model';
import { WhoseTurn } from '@models/game-state.model';

@Component({
  templateUrl: './game-play.component.html',
  styleUrls: ['./game-play.component.css'],
})
export class GamePlayComponent implements OnInit {
  public gameStatus: string;
  public whoseTurn: string;
  public gameTurnNumber: number;
  public opponent: string;

  constructor(private router: Router, private game: GameService) {}

  public ngOnInit(): void {
    console.log(this.game.getGame());
    if (!this.game.getGame()) {
      this.router.navigate(['start']);
    } else {
      let game = this.game.getGame();
      this.gameStatus = game.gameStage;
      this.whoseTurn = game.gameTurnPlayer;
      this.gameTurnNumber = game.gameTurnNumber;
      this.opponent = 'todo'; //todo: how to get opponents name?
    }
  }

  public onBack() {
    this.router.navigate(['']);
  }
}
