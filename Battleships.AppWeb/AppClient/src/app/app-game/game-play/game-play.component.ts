import { CommentModel } from '@models/comment.model';
import { PlayerService } from '@services/player.service';
import { BoardCell } from '@models/board-cell.model';
import { ChatMessage } from './../../app-core/_models/chat-message.model';
import { AuthService } from '@services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@services/game.service';
import { SignalRService } from '@services/signal-r.service';
import { environment } from '@environments/environment';
import { ModalService } from '@services/modal.service';
import { GameState } from '@models/game-state.model';
import { Subscription, timer } from 'rxjs';
import { BoardService } from '@services/board.service';
import { CommentsService } from '@services/comments.service';
import { HttpClient } from '@angular/common/http';
import { Player } from '@models/player.model';
import { AiService } from '@services/ai.service';
import { Coordinates } from '@models/coordinates.model';

@Component({
  templateUrl: './game-play.component.html',
  styleUrls: ['./game-play.component.css'],
})
export class GamePlayComponent implements OnInit {
  public multiplayer: boolean = false;
  private aiPlayerNumber: number = -1;
  public gameEnded: boolean = false;
  public gameBoardComment: CommentModel = this.comments.getInitialComment();
  public gameLink: string =
    environment.clientUrl + 'connect-game/' + this.game.getGame().gameId;
  public userName: string = '';
  public clientsName: string = '';
  public opponentsName: string = '';
  public isStartAllowed: boolean = false;
  public chatMessage: string = '';
  public chatMessages: Array<ChatMessage> = [];
  public turnNo: number = -1;
  public whoseTurnName: string = '';
  public whoseTurnNumber: number = -1;
  public clientsPlayerNumber: number = -1;
  public opponentsPlayerNumber: number = -1;
  private countDown: Subscription;
  public count: number = 30;
  public boards: Array<BoardCell[][]> = [];
  private isResultBeingDisplayed: boolean = false;
  private _subGame: any;
  private _subMessage: any;

  constructor(
    private ai: AiService,
    private http: HttpClient,
    private comments: CommentsService,
    private board: BoardService,
    private auth: AuthService,
    private modalService: ModalService,
    private router: Router,
    private game: GameService,
    private signalRService: SignalRService,
    private player: PlayerService
  ) {}

  ngOnDestroy() {
    if (this._subGame && this._subMessage) {
      this._subGame.unsubscribe();
      this._subMessage.unsubscribe();
    }
  }

  public ngOnInit(): void {
    if (!this.game.isGameStarted()) {
      this.router.navigate(['']);
    }
    this.userName = this.auth.getAuth().user;
    this.startCounter();
    this.initGameSubscription();
    this.resetMessageListeners();
    this.updateGameValues(this.game.getGame());
  }

  private updateGameValues(game: GameState): void {
    if (game) {
      this.multiplayer = game.gameMulti;
      this.clientsPlayerNumber = this.player.getPlayerNumber();
      this.clientsPlayerNumber == 0
        ? (this.opponentsPlayerNumber = 1)
        : (this.opponentsPlayerNumber = 0);
      this.clientsName = game.players[this.clientsPlayerNumber].displayName;
      this.opponentsName = game.players[this.opponentsPlayerNumber].displayName;
      this.boards[0] = game.players[0].board;
      this.boards[1] = game.players[1].board;
      this.turnNo = game.gameTurnNumber;
      this.whoseTurnNumber = game.gameTurnPlayer;
      this.whoseTurnName = game.players[this.whoseTurnNumber].displayName;
      this.isStartAllowed = game.isStartAllowed;
      this.isResultBeingDisplayed = game.displayingResults;
      this.setupGameBoardCommentsAndGame(game.fireResult);
      this.resetBoardColors();
      if (!game.gameMulti && !this.isResultBeingDisplayed) {
        this.aiPlayerNumber = this.findAiPlayerNumber(game.players); //todo: only once
        if (this.whoseTurnNumber == this.aiPlayerNumber) {
          let coord: Coordinates = this.ai.getFireCoordinates(
            this.boards[this.clientsPlayerNumber]
          );

          this.fire(coord.row, coord.col);
        }
      }
    }
  }

  private findAiPlayerNumber(players: Player[]): number {
    for (let i = 0; i < players.length; i++) {
      if (players[i].userName == 'COMPUTER') {
        return i;
      }
    }
  }

  private setupGameBoardCommentsAndGame(fireResult: boolean): void {
    !this.isStartAllowed || this.isResultBeingDisplayed
      ? this.gameIsNotAllowedOrResultsBeingDisplayed(fireResult)
      : this.setupNextRound();
  }

  private gameIsNotAllowedOrResultsBeingDisplayed(fireResult: boolean): void {
    this.isResultBeingDisplayed
      ? this.resultIsBeingDisplayed(fireResult)
      : this.gameIsNotAllowed();
  }

  private resultIsBeingDisplayed(fireResult: boolean): void {
    let winner: number = this.checkForWinner();

    winner > -1
      ? this.weHaveWinner(winner)
      : this.AddLastRoundComments(fireResult);
  }

  private gameIsNotAllowed(): void {
    this.gameBoardComment = this.comments.getWaitingComment();
  }

  private setupNextRound(): void {
    if (this.whoseTurnNumber == this.clientsPlayerNumber) {
      this.count = 30;
      this.gameBoardComment = this.comments.getYourTurnComment();
    } else {
      this.gameBoardComment = this.comments.getOpponentsTurnComment();
    }
  }

  private AddLastRoundComments(fireResult: boolean): void {
    if (fireResult) {
      this.whoseTurnNumber == this.clientsPlayerNumber
        ? (this.gameBoardComment = this.comments.getHitComment())
        : (this.gameBoardComment = this.comments.getLostComment());
    } else {
      this.whoseTurnNumber == this.clientsPlayerNumber
        ? (this.gameBoardComment = this.comments.getMissedComment())
        : (this.gameBoardComment = this.comments.getNoLostComment());
    }
  }

  private checkForWinner(): number {
    return this.board.isThereAWinner(this.game.getGame().players);
  }

  private weHaveWinner(winner: number): void {
    let message: string = '';
    message =
      winner == this.clientsPlayerNumber
        ? 'You won this batle!'
        : 'You lost this battle.';
    this.addWonGame(message);
  }

  private addWonGame(message: string): void {
    const url = environment.apiUrl + 'api/user/winner';
    const data = {
      UserName: this.auth.getAuth().user,
      Multiplayer: this.game.getGame().gameMulti,
    };
    this.http.post<any>(url, data).subscribe(() => {
      this.modalService.open('info-modal', message);
      this.gameEnded = true;
    });
  }

  private resetBoardColors(): void {
    this.boards[this.opponentsPlayerNumber] = this.board.eraseOpponentsShips(
      this.boards[this.opponentsPlayerNumber]
    );

    this.boards[this.clientsPlayerNumber] = this.board.showOwnShips(
      this.boards[this.clientsPlayerNumber]
    );
  }

  private startCounter() {
    this.countDown = timer(0, 1000).subscribe(() => {
      if (this.isStartAllowed && !this.gameEnded) {
        if (this.count <= 0) {
          this.nextRound();
          this.count = 30;
        } else {
          if (
            this.clientsPlayerNumber == this.whoseTurnNumber &&
            !this.isResultBeingDisplayed
          ) {
            this.count--;
          }
        }
      } else {
        this.count = 30;
      }
      return this.count;
    });
  }

  private nextRound(): void {
    this.fire(-1, -1);
  }

  private resetMessageListeners() {
    this.signalRService.removeChatMessageListener();
    this.signalRService.removeGameStateListener();
    this.signalRService.addChatMessageListener();
    this.signalRService.addGameStateListener();
  }

  private initGameSubscription() {
    this._subGame = this.game.gameStateChange.subscribe((game) => {
      this.updateGameValues(game);
    });
    this._subMessage = this.signalRService.messageChange.subscribe(
      (message: ChatMessage) => {
        this.chatMessages = [message].concat(this.chatMessages);
      }
    );
  }

  public sendChatMessage(): void {
    if (this.chatMessage != '') {
      this.signalRService.broadcastChatMessage(this.chatMessage);
      this.chatMessage = '';
    }
  }

  public fire(row: number, col: number): void {
    console.log('fire:');
    console.log('row: ' + row);
    console.log('col: ' + col);
    let coord: Coordinates = { row: row, col: col } as Coordinates;
    if (
      !this.isResultBeingDisplayed &&
      !this.gameEnded &&
      !this.isCellAlreadyShot(coord)
    ) {
      let game = this.game.getGame();
      let isHit: boolean = this.verifyHit(game.gameMulti, coord);
      if (isHit) {
        game.fireResult = true;

        if (!game.gameMulti) {
          game.players =
            this.aiPlayerNumber == this.whoseTurnNumber
              ? this.markHitOnBoard(
                  this.clientsPlayerNumber,
                  coord,
                  game.players
                )
              : this.markHitOnBoard(this.aiPlayerNumber, coord, game.players);
        } else {
          game.players = this.markHitOnBoard(
            this.opponentsPlayerNumber,
            coord,
            game.players
          );
        }
      } else {
        game.fireResult = false;
        if (!game.gameMulti) {
          game.players =
            this.aiPlayerNumber == this.whoseTurnNumber
              ? this.markMissedOnBoard(
                  this.clientsPlayerNumber,
                  coord,
                  game.players
                )
              : this.markMissedOnBoard(
                  this.aiPlayerNumber,
                  coord,
                  game.players
                );
        } else {
          game.players = this.markMissedOnBoard(
            this.opponentsPlayerNumber,
            coord,
            game.players
          );
        }
      }

      this.updateOpponentDisplayResult(game);
      setTimeout(() => this.updateTurnDataAndContinue(game, isHit), 3000);
    }
  }

  private isCellAlreadyShot(coord: Coordinates): boolean {
    let board: BoardCell[][] = [];
    if (!this.game.getGame().gameMulti) {
      board =
        this.aiPlayerNumber == this.whoseTurnNumber
          ? this.boards[this.clientsPlayerNumber]
          : this.boards[this.aiPlayerNumber];
    } else {
      board = this.boards[this.opponentsPlayerNumber];
    }
    let result: boolean = this.board.isCellAlreadyShot(coord, board);

    if (result) {
      console.log('not allowed value:');
      console.log(
        this.boards[this.clientsPlayerNumber][coord.row][coord.col].value
      );
      this.gameBoardComment = this.comments.getShootTwiceComment();
    }

    return result;
  }

  private updateOpponentDisplayResult(game: GameState) {
    game.displayingResults = true;
    this.signalRService.broadcastGameState(game);
  }

  private updateTurnDataAndContinue(game: GameState, isHit: boolean) {
    game.displayingResults = false;
    if (isHit) {
      game.gameTurnPlayer = this.whoseTurnNumber;
      game.gameTurnNumber = this.turnNo;
    } else {
      if (this.whoseTurnNumber == 0) {
        game.gameTurnPlayer = 1;
        game.gameTurnNumber = this.turnNo;
      } else {
        game.gameTurnPlayer = 0;
        game.gameTurnNumber++;
      }
    }

    this.signalRService.broadcastGameState(game);
  }

  private verifyHit(gameMulti: boolean, coord: Coordinates): boolean {
    if (coord.col < 0 && coord.row < 0) {
      return false;
    }

    let board: BoardCell[][] = this.getCorrectBoard(gameMulti);

    if (board[coord.col][coord.row].value == 1) {
      return true;
    }
    return false;
  }

  private getCorrectBoard(gameMulti: boolean): BoardCell[][] {
    if (!gameMulti) {
      return this.aiPlayerNumber == this.whoseTurnNumber
        ? this.boards[this.clientsPlayerNumber]
        : this.boards[this.aiPlayerNumber];
    } else {
      return this.boards[this.opponentsPlayerNumber];
    }
  }

  private markHitOnBoard(
    playerNumber: number,
    coord: Coordinates,
    players: Player[]
  ): Player[] {
    if (coord.col >= 0 && coord.row >= 0) {
      players[playerNumber].board[coord.col][coord.row].value = 2;
      players[playerNumber].board[coord.col][coord.row].color = 'red';
    }

    return players;
  }

  private markMissedOnBoard(
    playerNumber: number,
    coord: Coordinates,
    players: Player[]
  ): Player[] {
    if (coord.col >= 0 && coord.row >= 0) {
      players[playerNumber].board[coord.col][coord.row].value = 3;
      players[playerNumber].board[coord.col][coord.row].color =
        'rgb(0, 162, 255)';
    }

    return players;
  }

  public copyToClipboard(): void {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', this.gameLink);
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
  }

  public shareOnFacebook(): void {
    let url: string =
      'https://www.facebook.com/sharer/sharer.php?u=' + this.gameLink;
    var win = window.open(url, '_blank');
    win.focus();
  }

  public playWithAi(): void {
    let game = this.game.getGame();
    game.gameMulti = false;
    game.gameAi = true;
    game.players = this.setComputerOpponent(game.players);

    this.game.setGame(game);
    this.signalRService.broadcastGameState(game);
  }

  private setComputerOpponent(players: Player[]): Player[] {
    for (let i = 0; i < players.length; i++) {
      if (players[i].userName == '') {
        players[i].userName = 'COMPUTER';
        players[i].displayName = 'COMPUTER';

        return players;
      }
    }
  }
}
