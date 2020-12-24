import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { environment } from '@environments/environment';
import { GameState } from '@models/game-state.model';
import { ChatMessage } from '@models/chat-message.model';
import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';
import { ModalService } from '@services/modal.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private redirectToHome: boolean = true;
  private hubConnection: signalR.HubConnection;
  private url = environment.apiUrl + 'messageHub';
  private thenable: Promise<void>;
  public message: ChatMessage;
  public messageChange: Subject<ChatMessage> = new Subject<ChatMessage>();

  constructor(
    private modalService: ModalService,
    public auth: AuthService,
    private game: GameService,
    private router: Router
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

  public stopConnection(redirectToHome: boolean): void {
    this.redirectToHome = redirectToHome;
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  private connectionHubClosed(): void {
    this.game.setGame(null);
    if (this.game.isGameStarted()) {
      this.modalService.open(
        'info-modal',
        'You have been disconnected from game you played.'
      );

      if (this.redirectToHome) {
        this.router.navigate(['']);
      }
    }
    this.hubConnection = null;
  }

  public removeGameStateListener(): void {
    this.hubConnection.off('ReceiveGameState');
  }

  public addGameStateListener = (): void => {
    this.hubConnection.on('ReceiveGameState', (gameState: GameState) => {
      this.game.setGame(gameState);
    });
  };

  public broadcastGameState = (game: GameState): void => {
    if (game && this.hubConnection) {
      this.thenable.then(() => {
        this.hubConnection
          .invoke('SendGameState', game)
          .catch((err) => console.error('game state broadcast error: ' + err));
      });
    }
  };

  public removeChatMessageListener(): void {
    this.hubConnection.off('ReceiveChatMessage');
  }

  public addChatMessageListener = (): void => {
    this.hubConnection.on('ReceiveChatMessage', (chatMessage: ChatMessage) => {
      console.log(
        chatMessage.displayName + ' is writing: ' + chatMessage.message
      );
      this.message = chatMessage;
      this.messageChange.next(this.message);
    });
  };

  public broadcastChatMessage = (message: string): void => {
    if (message && this.hubConnection) {
      this.thenable.then(() => {
        let playersNames = [];
        for (let i = 0; i < this.game.getGame().players.length; i++) {
          if (this.game.getGame().players[i].userName) {
            playersNames.push(this.game.getGame().players[i].userName);
          }
        }
        this.hubConnection
          .invoke('SendChatMessage', message, playersNames)
          .catch((err) => console.error('chat broadcast error: ' + err));
      });
    }
  };
}
