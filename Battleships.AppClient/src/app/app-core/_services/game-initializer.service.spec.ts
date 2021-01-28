import { GameService } from '@services/game.service';
import { AuthService } from '@services/auth.service';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameInitializerService } from './game-initializer.service';
import { ModalService } from './modal.service';
import { SignalRService } from './signal-r.service';
import { GameState } from '@models/game-state.model';
import { LoginResponse } from '@models/login-response.model';

describe('GameInitializerService', () => {
  let service: GameInitializerService;
  const modalServiceMock = jasmine.createSpyObj('ModalService', ['open']);
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  const authServiceMock = jasmine.createSpyObj('AuthService', ['getAuth']);
  const gameServiceMock = jasmine.createSpyObj('GameService', [
    'initGame',
    'setComputerOpponent',
    'setPlayerNames',
  ]);
  const signalrServiceMock = jasmine.createSpyObj('SignalRService', [
    'startConnection',
    'broadcastChatMessage',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameInitializerService,
        { provide: ModalService, useValue: modalServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: GameService, useValue: gameServiceMock },
        { provide: SignalRService, useValue: signalrServiceMock },
      ],
    });
    service = new GameInitializerService(
      modalServiceMock,
      routerMock,
      authServiceMock,
      gameServiceMock,
      signalrServiceMock
    );
    let user: LoginResponse = {
      user: 'any_user',
      displayName: 'any_name',
    } as LoginResponse;
    authServiceMock.getAuth.and.returnValue(user);
    routerMock.navigate.and.returnValue(Promise.resolve());
    routerMock.navigate.calls.reset();
    modalServiceMock.open.calls.reset();
    gameServiceMock.initGame.calls.reset();
  });

  it('Service_ShouldBeCreated', () => {
    expect(service).toBeTruthy();
  });

  it('initGame_OnGameNull_NavigatesToHomeViewAndOpensModalWindow', (done) => {
    let game: GameState = null;
    let isAlreadyPlayed: boolean = true;
    let isMulti: boolean = true;
    let isEmptySlot: boolean = true;
    service
      .initGame(game, isAlreadyPlayed, isMulti, isEmptySlot)
      .then(function () {
        expect(modalServiceMock.open).toHaveBeenCalledTimes(1);
        done();
      });

    expect(routerMock.navigate).toHaveBeenCalledWith(['']);
  });

  it('initGame_OnAlreadyPlayedThisGame_CallsInitGameOnce', (done) => {
    let game: GameState = {} as GameState;
    let isAlreadyPlayed: boolean = true;
    let isMulti: boolean = true;
    let isEmptySlot: boolean = false;
    service
      .initGame(game, isAlreadyPlayed, isMulti, isEmptySlot)
      .then(function () {
        done();
      });

    expect(gameServiceMock.initGame).toHaveBeenCalledTimes(1);
  });

  it('initGame_OnEmptyPlayersSlotAndNotPlayedGameYet_CallsSetPlayerAndStartConnectionOnce', (done) => {
    let game: GameState = {} as GameState;
    let isAlreadyPlayed: boolean = false;
    let isMulti: boolean = true;
    let isEmptySlot: boolean = true;
    service
      .initGame(game, isAlreadyPlayed, isMulti, isEmptySlot)
      .then(function () {
        done();
      });

    expect(gameServiceMock.setPlayerNames).toHaveBeenCalledTimes(1);
    expect(signalrServiceMock.startConnection).toHaveBeenCalledTimes(1);
  });

  it('initGame_OnNoEmptySlots_NavigatesToHomeViewAndOpensModalWindow', (done) => {
    let game: GameState = {} as GameState;
    let isAlreadyPlayed: boolean = false;
    let isMulti: boolean = true;
    let isEmptySlot: boolean = false;
    service
      .initGame(game, isAlreadyPlayed, isMulti, isEmptySlot)
      .then(function () {
        expect(modalServiceMock.open).toHaveBeenCalledTimes(1);
        done();
      });

    expect(routerMock.navigate).toHaveBeenCalledWith(['']);
  });
});
