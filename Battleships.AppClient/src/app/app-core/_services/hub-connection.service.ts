import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { environment } from '@environments/environment';
import { ChatMessage } from '@models/chat-message.model';
import { GameState } from '@models/game-state.model';
import { Subject } from 'rxjs';
import { ModalService } from './modal.service';

@Injectable()
export class HubConnectionService {
  private isGameStarted: boolean = false;
  public message: ChatMessage;
  public messageChange: Subject<ChatMessage> = new Subject<ChatMessage>();
  public gameState: GameState;
  public gameChange: Subject<GameState> = new Subject<GameState>();
  private url = environment.apiUrl + 'messageHub';
  private hubReceiveChatMessageMethodName: string = 'ReceiveChatMessage';
  private hubSendChatMessageMethodName: string = 'SendChatMessage';
  private hubReceiveGameStateMethodName: string = 'ReceiveGameState';
  private hubSendGameStateMethodName: string = 'SendGameState';
  private thenable: Promise<void>;
  private hubConnection: signalR.HubConnection;

  constructor(private modalService: ModalService) {}

  public createHubConnectionBuilder(token: string): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.url, { accessTokenFactory: () => token })
      .build();
    this.startHubConnection();
    this.hubConnection.onclose(() => this.connectionHubClosed());
  }

  private startHubConnection(): void {
    this.thenable = this.hubConnection.start();
    this.thenable.catch((err) =>
      this.modalService.open(
        'info-modal',
        'Error while establishing connection: ' + err
      )
    );
  }

  public disconnect(isGameStarted: boolean): void {
    this.isGameStarted = isGameStarted;
    this.hubConnection.stop();
  }

  public restart(isGameStarted: boolean) {
    this.isGameStarted = isGameStarted;
    this.disconnect(isGameStarted);
    this.startHubConnection();
  }

  private connectionHubClosed(): void {
    if (this.isGameStarted) {
      this.modalService.open(
        'info-modal',
        'You are now disconnected from game you played.'
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
    this.thenable.then(() => {
      this.hubConnection
        .invoke(this.hubSendGameStateMethodName, game)
        .catch((err) =>
          this.modalService.open(
            'info-modal',
            'Game state broadcast error: ' + err
          )
        );
    });
  }

  public connectionGameStateOff(): void {
    this.hubConnection.off(this.hubReceiveGameStateMethodName);
  }

  public connectionGameStateOn() {
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

  public broadcastChat(message: string, playersNames: string[]) {
    this.thenable.then(() => {
      this.hubConnection
        .invoke(this.hubSendChatMessageMethodName, message, playersNames)
        .catch((err) =>
          this.modalService.open('info-modal', 'Chat broadcast error: ' + err)
        );
    });
  }
}
