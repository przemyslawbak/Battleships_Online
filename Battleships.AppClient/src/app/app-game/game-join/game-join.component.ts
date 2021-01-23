import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from '@services/http.service';
import { GameService } from '@services/game.service';

import { OpenGames } from '@models/open-games.model';

@Component({
  templateUrl: './game-join.component.html',
  styleUrls: ['./game-join.component.css'],
})
export class GameJoinComponent implements OnInit {
  public gameList: OpenGames[] = [];
  public currentGameId: number = 0;
  public note: string = 'Loading list...';

  constructor(
    private router: Router,
    private http: HttpService,
    public game: GameService
  ) {}

  public ngOnInit(): void {
    if (this.game.isGameStarted()) {
      this.currentGameId = this.game.getGame().gameId;
    } else {
      this.currentGameId = 0;
    }
    this.getOpenGames();
  }

  public redirect(gameId: number): void {
    this.router.navigate(['connect-game/' + gameId]);
  }

  private getOpenGames(): void {
    this.http.getOpenGames().subscribe((val: OpenGames[]) => {
      this.gameList = val;
      if (this.gameList.length == 0 || !this.gameList) {
        this.note = 'No games found!';
      } else {
        this.note = 'Found games.';
      }
    });
  }

  public onBack() {
    this.router.navigate(['']);
  }
}
