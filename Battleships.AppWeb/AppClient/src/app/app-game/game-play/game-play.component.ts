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

@Component({
  templateUrl: './game-play.component.html',
  styleUrls: ['./game-play.component.css'],
})
export class GamePlayComponent implements OnInit {
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
    this.startCounter();
    this.initGameSubscription();
    this.resetMessageListeners();
  }

  private startCounter() {
    this.countDown = timer(0, 1000).subscribe(() => {
      if (this.isStartAllowed) {
        if (this.count <= 0) {
          this.nextRound();
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
    //todo: next player/turn, reset counter
  }

  private resetMessageListeners() {
    this.signalRService.startConnection();
    this.signalRService.removeChatMessageListener();
    this.signalRService.removeGameStateListener();
    this.signalRService.addChatMessageListener();
    this.signalRService.addGameStateListener();
  }

  private initGameSubscription() {
    this._subGame = this.game.gameStateChange.subscribe((game) => {
      this.clientsPlayerNumber = this.player.getPlayerNumber();
      if (this.clientsPlayerNumber == 0) {
        this.opponentsPlayerNumber = 1;
      } else {
        this.opponentsPlayerNumber = 0;
      }
      this.clientsName = game.players[this.clientsPlayerNumber].displayName;
      this.opponentsName = game.players[this.opponentsPlayerNumber].displayName;
      this.boards[0] = game.players[0].board;
      this.boards[1] = game.players[1].board;
      this.turnNo = game.gameTurnNumber;
      this.whoseTurnNumber = game.gameTurnPlayer;
      this.whoseTurnName = game.players[this.whoseTurnNumber].displayName;
      this.isStartAllowed = game.isStartAllowed;
      console.log('hit game');
    });
    this._subMessage = this.signalRService.messageChange.subscribe(
      (message: ChatMessage) => {
        this.chatMessages = [message].concat(this.chatMessages);
        console.log('hit msg');
      }
    );
  }

  public sendChatMessage(): void {
    if (this.chatMessage != '') {
      this.signalRService.broadcastChatMessage(this.chatMessage);
      this.chatMessage = '';
    }
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
