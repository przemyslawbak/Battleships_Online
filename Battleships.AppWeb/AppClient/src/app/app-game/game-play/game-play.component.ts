import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '@services/game.service';
import { SignalRService } from '@services/signal-r.service';

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
    private signalRService: SignalRService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      //todo: if game exists-> see if client was already playing this game id
      //todo: if want to join-> see if no restricted
      //todo: if game restricted-> message
      //todo: if game is full-> message
      //todo: if game NOT exists-> message

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
    this.signalRService.addMessageListener();
    this.signalRService.broadcastMessage(); //todo: remove after testing
  }

  public fireTorpedo(j: number, k: number) {
    alert('attacked: ' + j + '/' + k);
    //todo: check for valid hit
    //todo: check for ship being hit
  }

  private initVar(): void {
    let game = this.game.getGame();
    this.gameStatus = game.gameStage;
    this.whoseTurn = game.gameTurnPlayer;
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
