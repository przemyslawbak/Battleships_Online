import { ChatMessage } from './../../app-core/_models/chat-message.model';
import { GameChatComponent } from './game-chat.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignalRService } from '@services/signal-r.service';
import { Observable, of } from 'rxjs';
import { FormsModule } from '@angular/forms';

const signalrServiceMock = jasmine.createSpyObj('SignalRService', [
  'broadcastChatMessage',
  'messageChange',
]);
let component: GameChatComponent;
let fixture: ComponentFixture<GameChatComponent>;

describe('GameChatComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [GameChatComponent],
      providers: [{ provide: SignalRService, useValue: signalrServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(GameChatComponent);
    component = fixture.componentInstance;
    signalrServiceMock.broadcastChatMessage.calls.reset();
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });

  it('sendChatMessage_OnNotEmptyMessageString_CallsBroadcastChatMessage', () => {
    let message: string = 'any_message';
    component.chatMessage = message;
    component.sendChatMessage();

    expect(signalrServiceMock.broadcastChatMessage).toHaveBeenCalledWith(
      message
    );
  });

  it('sendChatMessage_OnEmptyMessageString_CallsBroadcastChatMessageNever', () => {
    let message: string = '';
    component.chatMessage = message;
    component.sendChatMessage();

    expect(signalrServiceMock.broadcastChatMessage).toHaveBeenCalledTimes(0);
  });

  it('template_OnMessageFromThisPlayer_DisplaysGreenColorName', () => {
    let messageModel: ChatMessage = {
      message: 'any_message',
      displayName: 'playerDisplay',
      userName: 'playerUser',
      time: '12:00:01',
    } as ChatMessage;
    const spy: any = TestBed.inject(SignalRService);
    spy.messageChange = Observable.of(messageModel);
    component.userName = 'playerUser';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.redColor')).toBeNull();
    expect(fixture.nativeElement.querySelector('.greenColor')).toBeTruthy();
  });

  it('template_OnMessageFromOtherPlayer_DisplaysRedColorName', () => {
    let messageModel: ChatMessage = {
      message: 'any_message',
      displayName: 'otherPlayerDisplay',
      userName: 'otherPlayerUser',
      time: '12:00:01',
    } as ChatMessage;
    const spy: any = TestBed.inject(SignalRService);
    spy.messageChange = Observable.of(messageModel);
    component.userName = 'playerUser';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.redColor')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.greenColor')).toBeNull();
  });
});
