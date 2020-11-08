import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '@services/game.service';

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
    private route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('id: ' + id);
    console.log(this.game.getGame());
    if (!this.game.getGame()) {
      this.router.navigate(['start']);
    } else {
      this.initVar();
      this.drawBoards();
    }
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
    this.player1 = game.players[0];
    this.player2 = game.players[1];
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
