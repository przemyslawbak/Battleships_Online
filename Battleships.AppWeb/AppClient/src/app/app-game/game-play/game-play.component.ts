import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@services/game.service';
import { NUM_PLAYERS, COLS, ROWS, BLOCK_SIZE } from '../constants';

@Component({
  templateUrl: './game-play.component.html',
  styleUrls: ['./game-play.component.css'],
})
export class GamePlayComponent implements OnInit {
  public gameStatus: string;
  public whoseTurn: string;
  public gameTurnNumber: number;
  public opponent: string;
  public ctx: CanvasRenderingContext2D;
  public boardP1: number[][];
  public boardP2: number[][];

  constructor(private router: Router, private game: GameService) {}

  public ngOnInit(): void {
    console.log(this.game.getGame());
    if (!this.game.getGame()) {
      this.router.navigate(['start']);
    } else {
      this.initBoards();
      this.initVar();
    }
  }

  initVar(): void {
    let game = this.game.getGame();
    this.gameStatus = game.gameStage;
    this.whoseTurn = game.gameTurnPlayer;
    this.gameTurnNumber = game.gameTurnNumber;
    this.opponent = game.guest; //todo: how to get opponents name?
  }

  initBoards(): void {
    this.boardP1 = this.getEmptyBoard();
    this.boardP2 = this.getEmptyBoard();

    this.drawBoard(this.boardP1);
    this.drawBoard(this.boardP2);
  }

  private drawBoard(board: number[][]): void {
    //todo: draw
  }

  public onBack(): void {
    this.router.navigate(['']);
  }

  public getEmptyBoard(): number[][] {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }
}
