import { Component, OnInit } from '@angular/core';
import { environment } from '@environments/environment';
import { Router } from '@angular/router';

import { AuthService } from '@services/auth.service';
import { HttpService } from '@services/http.service';
import { GameService } from '@services/game.service';
import { SignalRService } from '@services/signal-r.service';
import { ModalService } from '@services/modal.service';

import { OpenGames } from '@models/open-games';

@Component({
  templateUrl: './game-join.component.html',
  styleUrls: ['./game-join.component.css'],
})
export class GameJoinComponent implements OnInit {
  public gameList: Array<OpenGames>;
  public currentGame: number;

  constructor(
    private router: Router,
    private modalService: ModalService,
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
    if (this.currentGame != gameId) {
      this.signalRService.stopConnection();
      if (this.game.isGameStarted()) {
        this.modalService.open(
          'info-modal',
          'You have been disconnected from previous game.'
        );
      }
      this.game.setGame(null);
    }

    this.router.navigate(['play-game/' + gameId]);
  }

  private getOpenGames(): void {
    const url = environment.apiUrl + 'api/game/open';
    this.http.getData(url).subscribe((val) => {
      this.gameList = val;
    });
  }
}
