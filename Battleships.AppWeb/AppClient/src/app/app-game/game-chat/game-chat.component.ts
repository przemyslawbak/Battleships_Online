import { Component, Input, OnInit } from '@angular/core';
import { ChatMessage } from '@models/chat-message.model';
import { SignalRService } from '@services/signal-r.service';

@Component({
  selector: 'game-chat',
  templateUrl: './game-chat.component.html',
  styleUrls: ['./game-chat.component.css'],
})
export class GameChatComponent implements OnInit {
  @Input() public userName: string = '';
  @Input() public multiplayer: boolean = false;
  public chatMessage: string = '';
  private _subMessage: any;
  public chatMessages: Array<ChatMessage> = [];
  constructor(private signalRService: SignalRService) {}

  public ngOnInit(): void {
    this.initGameSubscription();
    this.resetMessageListeners();
  }

  public ngOnDestroy() {
    if (this._subMessage) {
      this._subMessage.unsubscribe();
    }
  }

  private resetMessageListeners() {
    this.signalRService.removeChatMessageListener();
    this.signalRService.addChatMessageListener();
  }

  private initGameSubscription() {
    this._subMessage = this.signalRService.messageChange.subscribe(
      (message: ChatMessage) => {
        this.chatMessages = [message].concat(this.chatMessages);
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
