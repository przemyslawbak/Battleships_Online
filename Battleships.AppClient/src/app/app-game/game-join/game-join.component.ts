import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '@services/auth.service';
import { HttpService } from '@services/http.service';
import { GameService } from '@services/game.service';
import { SignalRService } from '@services/signal-r.service';

import { OpenGames } from '@models/open-games.model';

@Component({
  templateUrl: './game-join.component.html',
  styleUrls: ['./game-join.component.css'],
})
export class GameJoinComponent implements OnInit {
  public gameList: Array<OpenGames> = [];
  public currentGame: number;
  public note: string = 'Loading list...';

  constructor(
    private router: Router,
    private signalRService: SignalRService,
    private http: HttpService,
    public auth: AuthService,
    public game: GameService
  ) {}

  public ngOnInit(): void {
    if (this.game.isGameStarted()) {
      this.currentGame = this.game.getGame().gameId;
    } else {
      this.currentGame = 0;
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
      }
    });
  }

  public onBack() {
    this.router.navigate(['']);
  }
}
