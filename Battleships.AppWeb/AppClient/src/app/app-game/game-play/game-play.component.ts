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

@Component({
  templateUrl: './game-play.component.html',
  styleUrls: ['./game-play.component.css'],
})
export class GamePlayComponent implements OnInit {
  public userName: string;
  public chatMessage: string = '';
  public chatMessages: Array<ChatMessage> = [];
  public gameStatus: any;
  public gameTurnNumber: number;
  public player1: string;
  public player2: string;
  public boardP1: BoardCell[][];
  public boardP2: BoardCell[][];
  private _subGame: any;
  private _subMessage: any;

  constructor(
    private auth: AuthService,
    private modalService: ModalService,
    private router: Router,
    private game: GameService,
    private route: ActivatedRoute,
    private signalRService: SignalRService,
    private http: HttpService
  ) {}

  ngOnDestroy() {
    if (this._subGame && this._subMessage) {
      this._subGame.unsubscribe();
      this._subMessage.unsubscribe();
    }
  }

  public ngOnInit(): void {
    this.initGameSubscription();
    this.resetMessageListeners();
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
      this.gameStatus = game.gameStage;
      this.gameTurnNumber = game.gameTurnNumber;
      this.player1 = game.players[0].displayName;
      this.player2 = game.players[1].displayName;
      this.boardP1 = game.players[0].board;
      this.boardP2 = game.players[1].board;
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
}
