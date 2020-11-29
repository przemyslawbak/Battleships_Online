import { Component, OnInit } from '@angular/core';
import { BoardCell } from '@models/board-cell.model';
import { ChatMessage } from '@models/chat-message.model';
import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';
import { SignalRService } from '@services/signal-r.service';
import { Observable, Subscription, timer } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Component({
  templateUrl: './game-deploy-ships.component.html',
  styleUrls: ['./game-deploy-ships.component.css'],
})
export class GameDeployShips implements OnInit {
  public isDeploymentAllowed: boolean;
  public chatMessage: string = '';
  public chatMessages: Array<ChatMessage> = [];
  public boardP1: BoardCell[][]; //todo: ony 1p?
  public boardP2: BoardCell[][]; //todo: ony 1p?
  private _subGame: any;
  private _subMessage: any;
  public userName: string;
  private countDown: Subscription;
  private count = 180;

  constructor(
    private auth: AuthService,
    private signalRService: SignalRService,
    private game: GameService
  ) {}

  ngOnDestroy() {
    this.countDown = null; //todo: what if goes out the view?
    if (this._subGame && this._subMessage) {
      this._subGame.unsubscribe();
      this._subMessage.unsubscribe();
    }
  }

  public ngOnInit(): void {
    this.startCounter();
    this.userName = this.auth.getAuth().user;
    //todo: do I need to reset them?
    this.resetMessageListeners();
    this.initGameSubscription();
  }

  private startCounter() {
    this.countDown = timer(0, 1000).subscribe(() => {
      this.count--;
      if (this.isDeploymentAllowed) {
        this.count--;
      } else {
        this.count = 180;
      }
      //todo: if count == 0 => auto deploy => ready
      console.log(this.count);
      return this.count;
    });
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
      this.isDeploymentAllowed = game.isDeploymentAllowed;
      this.boardP1 = game.players[0].board;
      this.boardP2 = game.players[1].board;
      console.log('hit game');
      console.log('depl: ' + this.isDeploymentAllowed);
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
