import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { environment } from '@environments/environment';
import { GameState } from '@models/game-state.model';
import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';
import { ModalService } from '@services/modal.service';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private gameState: GameState;
  private hubConnection: signalR.HubConnection;
  private url = environment.apiUrl + 'messageHub';
  private thenable: Promise<void>;

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
        'You have been disconnected from previous game.'
      );
    }
    this.hubConnection = null;
  }

  public addGameStateListener = (): void => {
    this.hubConnection.on('ReceiveMessage', (message: GameState) => {
      console.log('hit message');
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
        .invoke('SendMessage', message)
        .catch((err) => console.error('broadcast error: ' + err));
    });
  };
}
