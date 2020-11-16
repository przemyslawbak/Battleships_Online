import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { environment } from '@environments/environment';
import { GameState } from '@models/game-state.model';
import { ChatMessage } from '@models/chat-message.model';
import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';
import { ModalService } from '@services/modal.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection: signalR.HubConnection;
  private url = environment.apiUrl + 'messageHub';
  private thenable: Promise<void>;
  public message: ChatMessage;
  public messageChange: Subject<ChatMessage> = new Subject<ChatMessage>();

  constructor(
    private modalService: ModalService,
    public auth: AuthService,
    private game: GameService
  ) {}

  public startConnection = (): void => {
    if (!this.hubConnection) {
      const token = this.auth.getAuth().token;
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.url, { accessTokenFactory: () => token })
        .build();
      this.startHubConnection();

      this.hubConnection.onclose(() => this.connectionHubClosed());
    }
  };

  private startHubConnection() {
    this.thenable = this.hubConnection.start();
    this.thenable
      .then(() => console.log('Connection started!'))
      .catch((err) =>
        console.log('Error while establishing connection :( ' + err)
      );
  }

  public stopConnection = (): void => {
    if (this.hubConnection) {
      this.game.setGame(null);
      this.hubConnection.stop();
    }
  };

  private connectionHubClosed(): void {
    if (this.game.isGameStarted()) {
      this.modalService.open(
        'info-modal',
        'You have left the previous game you played.'
      );
    }
    this.hubConnection = null;
  }

  public addGameStateListener = (): void => {
    this.hubConnection.on('ReceiveGameState', (message: GameState) => {
      if (message.gameId == this.game.gameState.gameId) {
        this.game.setGame(message);
      }
    });
  };

  public broadcastGameState = (): void => {
    this.thenable.then(() => {
      const name = this.auth.getAuth().displayName;
      let message = this.game.getGame();
      this.hubConnection
        .invoke('SendGameState', message)
        .catch((err) => console.error('game state broadcast error: ' + err));
    });
  };

  public addChatMessageListener = (): void => {
    this.hubConnection.on('ReceiveChatMessage', (message: ChatMessage) => {
      console.log(message.displayName + ' is writing: ' + message.message);
      this.message = message;
      this.messageChange.next(this.message);
      //todo: do something with message
    });
  };

  public broadcastChatMessage = (message: string): void => {
    this.thenable.then(() => {
      let playersNames = this.game.getGame().playersNames;
      this.hubConnection
        .invoke('SendChatMessage', message, playersNames)
        .catch((err) => console.error('chat broadcast error: ' + err));
    });
  };
}
