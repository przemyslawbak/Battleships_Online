import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '@services/game.service';
import { SignalRService } from '@services/signal-r.service';
import { HttpService } from '@services/http.service';
import { environment } from '@environments/environment';

@Component({
  templateUrl: './game-play.component.html',
  styleUrls: ['./game-play.component.css'],
})
export class GamePlayComponent implements OnInit {
  public gameStatus: string;
  public whoseTurn: string;
  public gameTurnNumber: number;
  public player1: string;
  public player2: string;
  public ctx: CanvasRenderingContext2D;
  public boardP1: number[][];
  public boardP2: number[][];

  constructor(
    private router: Router,
    private game: GameService,
    private route: ActivatedRoute,
    private signalRService: SignalRService,
    private http: HttpService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const url = environment.apiUrl + 'api/game/join?id=' + id;
      this.http.getData(url).subscribe((game) => {
        if (game) {
          alert('game state OK');
          //todo: check if player is already playing it
          //if playing already: this.game = game; ->init
          //if NOT playing already: check if multiplayer
          //if NOT multiplayer: cancel-> message
          //if multiplayer: check if free slot
          //if NOT free slot: cancel-> message
          //if free slot: this.game = game; -> update props ->init
        } else {
          alert('game state NOT OK');
          //message: game could not be found
        }
      });
      //if game slot empty join game (update game status), else message

      //todo: add messages[] property to the game status model, keep limited qty of messages
      //todo: if can play:
      this.initGame();
    } else {
      if (this.game.isGameStarted()) {
        this.router.navigate(['play/' + this.game.getGame().gameId]);
      } else {
        this.router.navigate(['start']);
      }
    }
  }

  private initGame(): void {
    this.initVar();
    this.drawBoards();
    this.signalRService.startConnection();
    this.signalRService.addGameStateListener();
    this.signalRService.broadcastGameState();
  }

  public fireTorpedo(j: number, k: number) {
    alert('attacked: ' + j + '/' + k);
    //todo: check for valid hit
    //todo: check for ship being hit
  }

  private initVar(): void {
    let game = this.game.getGame();
    this.gameStatus = game.gameStage.toString();
    this.whoseTurn = game.gameTurnPlayer.toString();
    this.gameTurnNumber = game.gameTurnNumber;
    this.player1 = game.playersDisplay[0];
    this.player2 = game.playersDisplay[1];
    this.boardP1 = game.boardP1;
    this.boardP2 = game.boardP2;
  }

  private drawBoards(): void {
    this.drawBoard(this.boardP1);
    this.drawBoard(this.boardP2);
  }

  private drawBoard(board: number[][]): void {
    //todo: draw
  }

  public onBack(): void {
    this.router.navigate(['']);
  }
}
