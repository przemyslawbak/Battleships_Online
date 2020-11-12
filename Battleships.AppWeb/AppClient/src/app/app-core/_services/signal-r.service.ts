import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { environment } from '@environments/environment';
import { GameState } from '@models/game-state.model';
import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private gameState: GameState;
  private hubConnection: signalR.HubConnection;
  private url = environment.apiUrl + 'messageHub';
  private thenable: Promise<void>;

  constructor(public auth: AuthService, private game: GameService) {}

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
      this.hubConnection.stop();
    }
  };

  private connectionHubClosed(): void {
    //trigerred when lost connection with server
    this.hubConnection = null;
    alert('todo: SignalR connection closed');
  }

  public addGameStateListener = (): void => {
    this.hubConnection.on('ReceiveMessage', (message) => {
      this.gameState = message;
    });
  };

  public broadcastGameState = (): void => {
    this.thenable.then(() => {
      const name = this.auth.getAuth().displayName;
      let message = this.game.getGame();
      this.hubConnection
        .invoke('SendMessage', message)
        .catch((err) => console.error('broadcast error: ' + err));
    });
  };
}
