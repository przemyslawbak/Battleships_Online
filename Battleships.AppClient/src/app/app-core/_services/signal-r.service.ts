import { Injectable } from '@angular/core';
import { GameState } from '@models/game-state.model';
import { ChatMessage } from '@models/chat-message.model';
import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { HubConnectionService } from './hub-connection.service';

@Injectable()
export class SignalRService {
  public message: ChatMessage;
  public messageChange: Subject<ChatMessage> = new Subject<ChatMessage>();
  private _subChat: Subscription;
  private _subGame: Subscription;

  constructor(
    public auth: AuthService,
    private game: GameService,
    private router: Router,
    private hub: HubConnectionService
  ) {
    this.initConnectionSubscriptions();
  }

  public ngOnDestroy() {
    this._subChat.unsubscribe();
    this._subGame.unsubscribe();
  }

  private initConnectionSubscriptions() {
    this._subChat = this.hub.messageChange.subscribe((message: ChatMessage) => {
      this.message = message;
      this.messageChange.next(this.message);
    });
    this._subGame = this.hub.gameChange.subscribe((game: GameState) => {
      this.game.setGame(game);
    });
  }

  public async startConnection(): Promise<void> {
    await this.stopConnection();

    if (!this.hub.isConnectionStarted() && this.auth.isLoggedIn()) {
      const token = this.auth.getAuth().token;
      await this.hub.createHubConnectionBuilder(token);
      await this.hub.startHubConnection();
      this.hub.declareOnClose();
    }

    this.resetHubListeners();
  }

  public async stopConnection(): Promise<void> {
    if (this.hub.isConnectionStarted()) {
      await this.hub.disconnect(this.game.isGameStarted());
    }

    this.router.navigate(['']);
  }

  public removeGameStateListener(): void {
    if (this.hub.isConnectionStarted()) {
      this.hub.connectionGameStateOff();
    }
  }

  public addGameStateListener(): void {
    this.hub.connectionGameStateOn();
  }

  public broadcastGameState(game: GameState): void {
    if (game && this.hub.isConnectionStarted()) {
      this.hub.broadcastGame(game);
    }
  }

  public removeChatMessageListener(): void {
    if (this.hub.isConnectionStarted()) {
      this.hub.connectionChatOff();
    }
  }

  public addChatMessageListener(): void {
    this.hub.connectionChatOn();
  }

  public broadcastChatMessage(message: string): void {
    let game: GameState = this.game.getGame();
    if (message && this.hub.isConnectionStarted() && game.gameMulti) {
      let playersNames: string[] = [];
      for (let i = 0; i < game.players.length; i++) {
        playersNames.push(game.players[i].userName);
      }
      this.hub.broadcastChat(message, playersNames);
    }
  }

  private resetHubListeners() {
    this.removeGameStateListener();
    this.addGameStateListener();
    this.removeChatMessageListener();
    this.addChatMessageListener();
  }
}
