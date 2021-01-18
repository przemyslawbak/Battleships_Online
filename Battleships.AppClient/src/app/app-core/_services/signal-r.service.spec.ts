import { Player } from './../_models/player.model';
import { TestBed } from '@angular/core/testing';
import { GameState } from '@models/game-state.model';
import 'rxjs/add/observable/of';
import { HubConnectionService } from './hub-connection.service';
import { ModalService } from './modal.service';
import { SignalRService } from './signal-r.service';
import { LoginResponse } from '@models/login-response.model';
import { ɵbypassSanitizationTrustResourceUrl } from '@angular/core';

describe('SignalRService', () => {
  let signalrService: SignalRService;
  const authServiceMock = jasmine.createSpyObj('AuthService', [
    'getAuth',
    'isLoggedIn',
  ]);
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  const modalServiceMock = jasmine.createSpyObj('ModalSevice', [
    'add',
    'open',
    'close',
  ]);
  let hubServiceMock: any;
  const gameServiceMock = jasmine.createSpyObj('GameService', [
    'getGame',
    'isGameStarted',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HubConnectionService,
        { provide: ModalService, useValue: modalServiceMock },
      ],
    });
    hubServiceMock = TestBed.inject(HubConnectionService);
    signalrService = new SignalRService(
      authServiceMock,
      gameServiceMock,
      routerMock,
      hubServiceMock
    );
  });

  it('Service_ShouldBeCreated', () => {
    spyOn(hubServiceMock.messageChange, 'next');
    spyOn(hubServiceMock.gameChange, 'next');
    expect(signalrService).toBeTruthy();
  });

  it('stopConnection_OnConnectionStartedTrue_CallsDisconnectOnce', async () => {
    let spyIsConnectionStarted = spyOn(hubServiceMock, 'isConnectionStarted');
    spyIsConnectionStarted.and.returnValue(true);
    let spyDisconnect = spyOn(hubServiceMock, 'disconnect');
    spyDisconnect.calls.reset();
    await signalrService.stopConnection();

    expect(spyDisconnect).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['']);
  });

  it('stopConnection_OnConnectionStartedFalse_CallsDisconnectNever', async () => {
    let spyIsConnectionStarted = spyOn(hubServiceMock, 'isConnectionStarted');
    spyIsConnectionStarted.and.returnValue(false);
    let spyDisconnect = spyOn(hubServiceMock, 'disconnect');
    spyDisconnect.calls.reset();
    await signalrService.stopConnection();

    expect(spyDisconnect).toHaveBeenCalledTimes(0);
    expect(routerMock.navigate).toHaveBeenCalledWith(['']);
  });

  it('removeGameStateListener_OnConnectionStartedTrue_CallsConnectionGameStateOffOnce', () => {
    let spyIsConnectionStarted = spyOn(hubServiceMock, 'isConnectionStarted');
    spyIsConnectionStarted.and.returnValue(true);
    let spyConnectionOff = spyOn(hubServiceMock, 'connectionGameStateOff');
    signalrService.removeGameStateListener();

    expect(spyConnectionOff).toHaveBeenCalledTimes(1);
  });

  it('removeGameStateListener_OnConnectionStartedFalse_CallsConnectionGameStateOffNever', () => {
    let spyIsConnectionStarted = spyOn(hubServiceMock, 'isConnectionStarted');
    spyIsConnectionStarted.and.returnValue(false);
    let spyConnectionOff = spyOn(hubServiceMock, 'connectionGameStateOff');
    signalrService.removeGameStateListener();

    expect(spyConnectionOff).toHaveBeenCalledTimes(0);
  });

  it('broadcastGameState_OnConnectionStartedTrueAndGameObject_CallsBroadastGameOnce', () => {
    let spyIsConnectionStarted = spyOn(hubServiceMock, 'isConnectionStarted');
    spyIsConnectionStarted.and.returnValue(true);
    let spyBroadcastGame = spyOn(hubServiceMock, 'broadcastGame');
    let game = {} as GameState;
    signalrService.broadcastGameState(game);

    expect(spyBroadcastGame).toHaveBeenCalledTimes(1);
  });

  it('broadcastGameState_OnConnectionStartedFalseAndGameObject_CallsBroadastGameNever', () => {
    let spyIsConnectionStarted = spyOn(hubServiceMock, 'isConnectionStarted');
    spyIsConnectionStarted.and.returnValue(false);
    let spyBroadcastGame = spyOn(hubServiceMock, 'broadcastGame');
    let game = {} as GameState;
    signalrService.broadcastGameState(game);

    expect(spyBroadcastGame).toHaveBeenCalledTimes(0);
  });

  it('broadcastGameState_OnConnectionStartedFalseAndGameNull_CallsBroadastGameNever', () => {
    let spyIsConnectionStarted = spyOn(hubServiceMock, 'isConnectionStarted');
    spyIsConnectionStarted.and.returnValue(false);
    let spyBroadcastGame = spyOn(hubServiceMock, 'broadcastGame');
    let game = null;
    signalrService.broadcastGameState(game);

    expect(spyBroadcastGame).toHaveBeenCalledTimes(0);
  });

  it('broadcastGameState_OnConnectionStartedTrueAndGameNull_CallsBroadastGameNever', () => {
    let spyIsConnectionStarted = spyOn(hubServiceMock, 'isConnectionStarted');
    spyIsConnectionStarted.and.returnValue(true);
    let spyBroadcastGame = spyOn(hubServiceMock, 'broadcastGame');
    let game = null;
    signalrService.broadcastGameState(game);

    expect(spyBroadcastGame).toHaveBeenCalledTimes(0);
  });

  it('removeChatMessageListener_OnConnectionStartedTrue_CallsConnectionChatOffOnce', () => {
    let spyIsConnectionStarted = spyOn(hubServiceMock, 'isConnectionStarted');
    spyIsConnectionStarted.and.returnValue(true);
    let spy = spyOn(hubServiceMock, 'connectionChatOff');
    signalrService.removeChatMessageListener();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('removeChatMessageListener_OnConnectionStartedFalse_CallsConnectionChatOffNever', () => {
    let spyIsConnectionStarted = spyOn(hubServiceMock, 'isConnectionStarted');
    spyIsConnectionStarted.and.returnValue(false);
    let spy = spyOn(hubServiceMock, 'connectionChatOff');
    signalrService.removeChatMessageListener();

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('broadcastChatMessage_OnMessageObjectAndGameMultiplayerAndConnectionStarted_CallsBroadcastChatOnce', () => {
    let spyIsConnectionStarted = spyOn(hubServiceMock, 'isConnectionStarted');
    spyIsConnectionStarted.and.returnValue(true);
    let spy = spyOn(hubServiceMock, 'broadcastChat');
    let msg = 'any_message';
    let players: Player[] = [
      { userName: 'one' } as Player,
      { userName: 'two' } as Player,
    ];
    let game = { gameMulti: true, players: players } as GameState;
    gameServiceMock.getGame.and.returnValue(game);
    signalrService.broadcastChatMessage(msg);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('broadcastChatMessage_OnMessageNullAndGameMultiplayerAndConnectionStarted_CallsBroadcastChatNever', () => {
    let spyIsConnectionStarted = spyOn(hubServiceMock, 'isConnectionStarted');
    spyIsConnectionStarted.and.returnValue(true);
    let spy = spyOn(hubServiceMock, 'broadcastChat');
    let msg = null;
    let players: Player[] = [
      { userName: 'one' } as Player,
      { userName: 'two' } as Player,
    ];
    let game = { gameMulti: true, players: players } as GameState;
    gameServiceMock.getGame.and.returnValue(game);
    signalrService.broadcastChatMessage(msg);

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('broadcastChatMessage_OnMessageObjectAndGameSinglePlayerAndConnectionStarted_CallsBroadcastChatNever', () => {
    let spyIsConnectionStarted = spyOn(hubServiceMock, 'isConnectionStarted');
    spyIsConnectionStarted.and.returnValue(true);
    let spy = spyOn(hubServiceMock, 'broadcastChat');
    let msg = 'any_message';
    let players: Player[] = [
      { userName: 'one' } as Player,
      { userName: 'two' } as Player,
    ];
    let game = { gameMulti: false, players: players } as GameState;
    gameServiceMock.getGame.and.returnValue(game);
    signalrService.broadcastChatMessage(msg);

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('broadcastChatMessage_OnMessageObjectAndGameMultiplayerAndConnectionNotStarted_CallsBroadcastChatNever', () => {
    let spyIsConnectionStarted = spyOn(hubServiceMock, 'isConnectionStarted');
    spyIsConnectionStarted.and.returnValue(false);
    let spy = spyOn(hubServiceMock, 'broadcastChat');
    let msg = 'any_message';
    let players: Player[] = [
      { userName: 'one' } as Player,
      { userName: 'two' } as Player,
    ];
    let game = { gameMulti: true, players: players } as GameState;
    gameServiceMock.getGame.and.returnValue(game);
    signalrService.broadcastChatMessage(msg);

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('startConnection_OnConnectionNotStartedAndLoggedInUser_CallsSeveralHubMethodsAndBuildsConnectionAndSetsConnectGameToTrue', async () => {
    let spyIsConnectionStarted = spyOn(hubServiceMock, 'isConnectionStarted');
    spyIsConnectionStarted.and.returnValue(false);
    let spy1 = spyOn(hubServiceMock, 'createHubConnectionBuilder');
    let spy2 = spyOn(hubServiceMock, 'connectionGameStateOff');
    let spy3 = spyOn(hubServiceMock, 'connectionGameStateOn');
    let spy4 = spyOn(hubServiceMock, 'connectionChatOff');
    let spy5 = spyOn(hubServiceMock, 'connectionChatOn');
    let spy6 = spyOn(hubServiceMock, 'startHubConnection');
    let spy7 = spyOn(hubServiceMock, 'declareOnClose');
    let spy8 = spyOn(hubServiceMock, 'disconnect');
    gameServiceMock.isGameStarted.and.returnValue(false);
    authServiceMock.isLoggedIn.and.returnValue(true);
    authServiceMock.getAuth.and.returnValue({
      token: 'any_token',
    } as LoginResponse);
    await signalrService.startConnection();

    expect(spy1).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(0);
    expect(spy3).toHaveBeenCalledTimes(1);
    expect(spy4).toHaveBeenCalledTimes(0);
    expect(spy5).toHaveBeenCalledTimes(1);
    expect(spy6).toHaveBeenCalledTimes(1);
    expect(spy7).toHaveBeenCalledTimes(1);
    expect(spy8).toHaveBeenCalledTimes(0);
  });

  it('startConnection_OnConnectionStartedAndLoggedInUser_CallsSeveralHubMethodsAndBuildsConnectionAndSetsConnectGameToTrue', async () => {
    let spyIsConnectionStarted = spyOn(hubServiceMock, 'isConnectionStarted');
    spyIsConnectionStarted.and.returnValue(true);
    let spy1 = spyOn(hubServiceMock, 'createHubConnectionBuilder');
    let spy2 = spyOn(hubServiceMock, 'connectionGameStateOff');
    let spy3 = spyOn(hubServiceMock, 'connectionGameStateOn');
    let spy4 = spyOn(hubServiceMock, 'connectionChatOff');
    let spy5 = spyOn(hubServiceMock, 'connectionChatOn');
    let spy6 = spyOn(hubServiceMock, 'startHubConnection');
    let spy7 = spyOn(hubServiceMock, 'declareOnClose');
    let spy8 = spyOn(hubServiceMock, 'disconnect');
    gameServiceMock.isGameStarted.and.returnValue(false);
    authServiceMock.isLoggedIn.and.returnValue(true);
    authServiceMock.getAuth.and.returnValue({
      token: 'any_token',
    } as LoginResponse);
    await signalrService.startConnection();

    expect(spy1).toHaveBeenCalledTimes(0);
    expect(spy2).toHaveBeenCalledTimes(1);
    expect(spy3).toHaveBeenCalledTimes(1);
    expect(spy4).toHaveBeenCalledTimes(1);
    expect(spy5).toHaveBeenCalledTimes(1);
    expect(spy6).toHaveBeenCalledTimes(0);
    expect(spy7).toHaveBeenCalledTimes(0);
    expect(spy8).toHaveBeenCalledTimes(1);
  });

  it('startConnection_OnConnectionStartedAndNotLoggedInUser_CallsSeveralHubMethodsAndBuildsConnectionAndSetsConnectGameToTrue', async () => {
    let spyIsConnectionStarted = spyOn(hubServiceMock, 'isConnectionStarted');
    spyIsConnectionStarted.and.returnValue(true);
    let spy1 = spyOn(hubServiceMock, 'createHubConnectionBuilder');
    let spy2 = spyOn(hubServiceMock, 'connectionGameStateOff');
    let spy3 = spyOn(hubServiceMock, 'connectionGameStateOn');
    let spy4 = spyOn(hubServiceMock, 'connectionChatOff');
    let spy5 = spyOn(hubServiceMock, 'connectionChatOn');
    let spy6 = spyOn(hubServiceMock, 'startHubConnection');
    let spy7 = spyOn(hubServiceMock, 'declareOnClose');
    let spy8 = spyOn(hubServiceMock, 'disconnect');
    gameServiceMock.isGameStarted.and.returnValue(false);
    authServiceMock.isLoggedIn.and.returnValue(false);
    authServiceMock.getAuth.and.returnValue({
      token: 'any_token',
    } as LoginResponse);
    await signalrService.startConnection();

    expect(spy1).toHaveBeenCalledTimes(0);
    expect(spy2).toHaveBeenCalledTimes(1);
    expect(spy3).toHaveBeenCalledTimes(1);
    expect(spy4).toHaveBeenCalledTimes(1);
    expect(spy5).toHaveBeenCalledTimes(1);
    expect(spy6).toHaveBeenCalledTimes(0);
    expect(spy7).toHaveBeenCalledTimes(0);
    expect(spy8).toHaveBeenCalledTimes(1);
  });

  it('startConnection_OnConnectionNotStartedAndNotLoggedInUser_CallsSeveralHubMethodsAndBuildsConnectionAndSetsConnectGameToTrue', async () => {
    let spyIsConnectionStarted = spyOn(hubServiceMock, 'isConnectionStarted');
    spyIsConnectionStarted.and.returnValue(false);
    let spy1 = spyOn(hubServiceMock, 'createHubConnectionBuilder');
    let spy2 = spyOn(hubServiceMock, 'connectionGameStateOff');
    let spy3 = spyOn(hubServiceMock, 'connectionGameStateOn');
    let spy4 = spyOn(hubServiceMock, 'connectionChatOff');
    let spy5 = spyOn(hubServiceMock, 'connectionChatOn');
    let spy6 = spyOn(hubServiceMock, 'startHubConnection');
    let spy7 = spyOn(hubServiceMock, 'declareOnClose');
    let spy8 = spyOn(hubServiceMock, 'disconnect');
    gameServiceMock.isGameStarted.and.returnValue(false);
    authServiceMock.isLoggedIn.and.returnValue(false);
    authServiceMock.getAuth.and.returnValue({
      token: 'any_token',
    } as LoginResponse);
    await signalrService.startConnection();

    expect(spy1).toHaveBeenCalledTimes(0);
    expect(spy2).toHaveBeenCalledTimes(0);
    expect(spy3).toHaveBeenCalledTimes(1);
    expect(spy4).toHaveBeenCalledTimes(0);
    expect(spy5).toHaveBeenCalledTimes(1);
    expect(spy6).toHaveBeenCalledTimes(0);
    expect(spy7).toHaveBeenCalledTimes(0);
    expect(spy8).toHaveBeenCalledTimes(0);
  });
});
