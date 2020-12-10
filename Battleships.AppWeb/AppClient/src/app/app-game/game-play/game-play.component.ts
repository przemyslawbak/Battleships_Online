import { PlayerService } from '@services/player.service';
import { BoardCell } from '@models/board-cell.model';
import { ChatMessage } from './../../app-core/_models/chat-message.model';
import { AuthService } from '@services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '@services/game.service';
import { SignalRService } from '@services/signal-r.service';
import { HttpService } from '@services/http.service';
import { environment } from '@environments/environment';
import { ModalService } from '@services/modal.service';
import { GameState } from '@models/game-state.model';
import { Subscription, timer } from 'rxjs';
import { BoardService } from '@services/board.service';

@Component({
  templateUrl: './game-play.component.html',
  styleUrls: ['./game-play.component.css'],
})
export class GamePlayComponent implements OnInit {
  public gameLink: string =
    environment.apiUrl + 'connect-game/' + this.game.getGame().gameId;
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
  private _subGame: any;
  private _subMessage: any;

  constructor(
    private board: BoardService,
    private auth: AuthService,
    private modalService: ModalService,
    private router: Router,
    private game: GameService,
    private route: ActivatedRoute,
    private signalRService: SignalRService,
    private http: HttpService,
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
    //todo: do I need to reset them?
    this.initGameSubscription();
    this.resetMessageListeners();
    this.updateGameValues(this.game.getGame());
  }

  private updateGameValues(game: GameState): void {
    if (game) {
      this.clientsPlayerNumber = this.player.getPlayerNumber();
      if (this.clientsPlayerNumber == 0) {
        this.opponentsPlayerNumber = 1;
      } else {
        this.opponentsPlayerNumber = 0;
      }
      this.clientsName = game.players[this.clientsPlayerNumber].displayName;
      this.opponentsName = game.players[this.opponentsPlayerNumber].displayName;
      console.clear();
      console.log(game.players[0].board);
      console.log(game.players[1].board);
      this.boards[0] = game.players[0].board;
      this.boards[1] = game.players[1].board;
      this.turnNo = game.gameTurnNumber;
      this.whoseTurnNumber = game.gameTurnPlayer;
      this.whoseTurnName = game.players[this.whoseTurnNumber].displayName;
      this.isStartAllowed = game.isStartAllowed;

      this.resetBoardColors();
    }
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
      if (this.isStartAllowed) {
        if (this.count <= 0) {
          this.nextRound();
          this.count = 30;
        } else {
          if (this.clientsPlayerNumber == this.whoseTurnNumber) {
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
    let isHit: boolean = this.verifyHit(row, col);
    let game = this.game.getGame();
    if (isHit) {
      game = this.markHitOnBoard(row, col, game);
      game.gameTurnPlayer = this.whoseTurnNumber;
      game.gameTurnNumber = this.turnNo;
      //todo: inform that hit
    } else {
      if (col >= 0 && row >= 0) {
        game = this.markMissedOnBoard(row, col, game);
        //todo: inform that missed
      }
      if (this.whoseTurnNumber == 0) {
        game.gameTurnPlayer = 1;
        game.gameTurnNumber = this.turnNo;
      } else {
        game.gameTurnPlayer = 0;
        game.gameTurnNumber++;
      }
    }

    this.count = 30;
    this.signalRService.broadcastGameState(game);
  }

  private verifyHit(col: number, row: number): boolean {
    if (col < 0 && row < 0) {
      return false;
    }

    if (this.boards[this.opponentsPlayerNumber][row][col].value == 1) {
      return true;
    }
    return false;
  }

  private markHitOnBoard(row: number, col: number, game: GameState) {
    game.players[this.opponentsPlayerNumber].board[col][row].value = 2;
    game.players[this.opponentsPlayerNumber].board[col][row].color = 'red';

    return game;
  }

  private markMissedOnBoard(row: number, col: number, game: GameState) {
    game.players[this.opponentsPlayerNumber].board[col][row].value = 3;
    game.players[this.opponentsPlayerNumber].board[col][row].color =
      'rgb(0, 162, 255)';

    return game;
  }

  public quitGame(): void {
    //todo:
    alert('quit');
  }

  public randomShot(): void {
    //todo:
    alert('random shot');
  }

  public kickOpponent(): void {
    //todo:
    alert('kick opponent');
  }
}
