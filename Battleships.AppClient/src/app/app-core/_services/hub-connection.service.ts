import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { environment } from '@environments/environment';
import { ChatMessage } from '@models/chat-message.model';
import { GameState } from '@models/game-state.model';
import { Subject } from 'rxjs';
import { ModalService } from './modal.service';

@Injectable({
  providedIn: 'root',
})
export class HubConnectionService {
  private isGameStarted: boolean = false;
  public message: ChatMessage;
  public gameState: GameState;
  public messageChange: Subject<ChatMessage> = new Subject<ChatMessage>();
  public gameChange: Subject<GameState> = new Subject<GameState>();
  private url = environment.apiUrl + 'messageHub';
  private hubReceiveChatMessageMethodName: string = 'ReceiveChatMessage';
  private hubSendChatMessageMethodName: string = 'SendChatMessage';
  private hubReceiveGameStateMethodName: string = 'ReceiveGameState';
  private hubSendGameStateMethodName: string = 'SendGameState';
  private hubConnection: signalR.HubConnection = null;

  constructor(private modalService: ModalService) {}

  public async createHubConnectionBuilder(token: string): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.url, { accessTokenFactory: () => token })
      .build();
  }

  public async startHubConnection(): Promise<void> {
    return new Promise((resolve) => {
      this.hubConnection.start().then(() => {
        resolve();
      });
    });
  }

  public declareOnClose(): void {
    this.hubConnection.onclose(() => this.connectionHubClosed());
  }

  public async disconnect(isGameStarted: boolean): Promise<void> {
    return new Promise((resolve) => {
      if (this.isConnectionStarted()) {
        this.isGameStarted = isGameStarted;
        this.hubConnection.stop().then(() => {
          this.hubConnection = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private connectionHubClosed(): void {
    if (this.isGameStarted) {
      this.modalService.open(
        'info-modal',
        'You have been disconnected from provious game.'
      );
    }
    this.gameState = null;
    this.gameChange.next(this.gameState);
    this.hubConnection = null;
  }

  public isConnectionStarted(): boolean {
    return this.hubConnection ? true : false;
  }

  public broadcastGame(game: GameState): void {
    this.hubConnection
      .invoke(this.hubSendGameStateMethodName, game)
      .catch((err) =>
        this.modalService.open(
          'info-modal',
          'Game state broadcast error: ' + err
        )
      );
  }

  public connectionGameStateOff(): void {
    this.hubConnection.off(this.hubReceiveGameStateMethodName);
  }

  public connectionGameStateOn(): void {
    this.hubConnection.on(
      this.hubReceiveGameStateMethodName,
      (gameState: GameState) => {
        this.gameState = gameState;
        this.gameChange.next(this.gameState);
      }
    );
  }

  public connectionChatOff(): void {
    this.hubConnection.off(this.hubReceiveChatMessageMethodName);
  }

  public connectionChatOn() {
    this.hubConnection.on(
      this.hubReceiveChatMessageMethodName,
      (chatMessage: ChatMessage) => {
        this.message = chatMessage;
        this.messageChange.next(this.message);
      }
    );
  }

  public broadcastChat(message: string, playersNames: string[]): void {
    this.hubConnection
      .invoke(this.hubSendChatMessageMethodName, message, playersNames)
      .catch((err) =>
        this.modalService.open('info-modal', 'Chat broadcast error: ' + err)
      );
  }
}
