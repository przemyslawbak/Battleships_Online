import { Injectable } from '@angular/core';
import { GameState } from '@models/game-state.model';
import { ChatMessage } from '@models/chat-message.model';
import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { HubConnectionService } from './hub-connection.service';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  public message: ChatMessage;
  public messageChange: Subject<ChatMessage> = new Subject<ChatMessage>();
  private _subChat: any;
  private _subGame: any;

  constructor(
    public auth: AuthService,
    private game: GameService,
    private router: Router,
    private hub: HubConnectionService
  ) {
    this.initConnectionSubscriptions();
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

  public startConnection(): void {
    if (!this.hub.isConnectionStarted() && this.auth.isLoggedIn()) {
      const token = this.auth.getAuth().token;
      this.hub.createHubConnectionBuilder(token);
      this.removeGameStateListener();
      this.addGameStateListener();
      this.removeChatMessageListener();
      this.addChatMessageListener();
    }
  }

  public restartConnection() {
    this.hub.restart(this.game.isGameStarted());
  }

  public stopConnection(): void {
    if (this.hub.isConnectionStarted()) {
      this.hub.disconnect(this.game.isGameStarted());
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
}
