import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { environment } from '@environments/environment';
import { SignalRObject } from '@models/signal-r.model';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private message: SignalRObject;
  private hubConnection: signalR.HubConnection;
  private url = environment.apiUrl + 'messageHub';
  private thenable: Promise<void>;

  public startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.url)
      .build();
    this.start();
  };

  private start() {
    this.thenable = this.hubConnection.start();
    this.thenable
      .then(() => console.log('Connection started!'))
      .catch((err) => console.log('Error while establishing connection :('));
  }

  public addMessageListener = () => {
    this.hubConnection.on('ReceiveMessage', (message) => {
      this.message = message;
      console.log('received: ' + this.message.someMessage);
    });
  };

  public broadcastMessage = () => {
    this.thenable.then(() => {
      let message = {} as SignalRObject;
      message.isSomething = true;
      message.someArray = ['one', 'two'];
      message.someMessage = 'fuck off';
      message.someName = 'Pszemek';
      message.someNumber = 69;
      this.hubConnection
        .invoke('SendMessage', message)
        .catch((err) => console.error(err));
    });
  };
}
