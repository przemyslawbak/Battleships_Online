import { LoginResponse } from '@models/login-response.model';
import { SignalRService } from '@services/signal-r.service';
import { FleetService } from '@services/fleet.service';
import { BoardService } from '@services/board.service';
import { GameDeployComponent } from './game-deploy-ships.component';
import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameService } from '@services/game.service';
import { AuthService } from '@services/auth.service';
import { AiService } from '@services/ai.service';
import { TextService } from '@services/text.service';
import { PlayerService } from '@services/player.service';
import { GameState } from '@models/game-state.model';
import { Observable } from 'rxjs';
import { Player } from '@models/player.model';
import { GameSetupComponent } from '../game-setup/game-setup.component';
import { GameChatComponent } from '../game-chat/game-chat.component';
import { ShipComponent } from '../game-ship/ship.component';
import { ChatMessage } from '@models/chat-message.model';
import { FormsModule } from '@angular/forms';

let component: GameDeployComponent;
let fixture: ComponentFixture<GameDeployComponent>;
const routerMock = jasmine.createSpyObj('Router', ['navigate']);
const gameServiceMock = jasmine.createSpyObj('GameService', [
  'isGameStarted',
  'getGameSpeedDivider',
  'getDeployCountdownValue',
  'getGame',
  'isGameSinglePlayer',
  'shouldBeDeployEnabled',
  'gameStateChange',
  'isPlayerDeployed',
]);
const authServiceMock = jasmine.createSpyObj('AuthService', ['getAuth']);
const boardServiceMock = jasmine.createSpyObj('BoardService', [
  'resetAvoidCellsArray',
  'getEmptyBoard',
  'deployShipOnBoard',
  'getShipsDropCells',
  'resetBoardElement',
  'getShipsDropCells',
  'updateHoveredElements',
  'verifyHoveredElement',
]);
const fleetServiceMock = jasmine.createSpyObj('FleetService', [
  'createFleet',
  'getShipListItem',
  'moveFromWaitingToDeployed',
]);
const aiServiceMock = jasmine.createSpyObj('AiService', [
  'autoDeploy',
  'setupAiPlayer',
]);
const textServiceMock = jasmine.createSpyObj('TextService', [
  'getIdFromElementName',
  'getFacebookShareLink',
  'copyLink',
]);
const signalrServiceMock = jasmine.createSpyObj('SignalRService', [
  'broadcastChatMessage',
  'broadcastGameState',
]);
const playerServiceMock = jasmine.createSpyObj('PlayerService', [
  'arePlayersDeployed',
  'getPlayerNumber',
  'setComputerPlayerOpponent',
  'findComputerPlayerNumber',
]);

describe('GameDeployComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [
        GameDeployComponent,
        GameSetupComponent,
        GameChatComponent,
      ],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: GameService, useValue: gameServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: BoardService, useValue: boardServiceMock },
        { provide: FleetService, useValue: fleetServiceMock },
        { provide: AiService, useValue: aiServiceMock },
        { provide: TextService, useValue: textServiceMock },
        { provide: SignalRService, useValue: signalrServiceMock },
        { provide: PlayerService, useValue: playerServiceMock },
      ],
    }).compileComponents();
    gameServiceMock.getGame.and.returnValue({
      gameId: 666,
      players: [],
    } as GameState);

    boardServiceMock.resetAvoidCellsArray.calls.reset();
    boardServiceMock.getEmptyBoard.calls.reset();
    gameServiceMock.getGameSpeedDivider.calls.reset();
    gameServiceMock.getDeployCountdownValue.calls.reset();
    gameServiceMock.getGame.calls.reset();
    authServiceMock.getAuth.calls.reset();
    playerServiceMock.arePlayersDeployed.calls.reset();
    routerMock.navigate.calls.reset();
    playerServiceMock.findComputerPlayerNumber.calls.reset();
    gameServiceMock.isGameSinglePlayer.calls.reset();
    fleetServiceMock.moveFromWaitingToDeployed.calls.reset();
    boardServiceMock.deployShipOnBoard.calls.reset();
    gameServiceMock.shouldBeDeployEnabled.calls.reset();
    boardServiceMock.getShipsDropCells.calls.reset();
    boardServiceMock.updateHoveredElements.calls.reset();
    signalrServiceMock.broadcastGameState.calls.reset();
    signalrServiceMock.broadcastChatMessage.calls.reset();

    fixture = TestBed.createComponent(GameDeployComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit_OnGameNotStarted_NavigatesToHomePage', () => {
    gameServiceMock.isGameStarted.and.returnValue(false);
    component.ngOnInit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['']);
  });

  it('ngOnInit_OnGameStarted_CallsBunchOfMethods', () => {
    const spy: any = TestBed.inject(GameService);
    spy.gameStateChange = Observable.of({} as GameState);
    playerServiceMock.arePlayersDeployed.and.returnValue(true);
    gameServiceMock.isGameStarted.and.returnValue(true);
    authServiceMock.getAuth.and.returnValue({
      user: 'any_user',
    } as LoginResponse);
    component.ngOnInit();

    expect(boardServiceMock.resetAvoidCellsArray).toHaveBeenCalledTimes(1);
    expect(boardServiceMock.getEmptyBoard).toHaveBeenCalledTimes(1);
    expect(gameServiceMock.getGameSpeedDivider).toHaveBeenCalledTimes(1);
    expect(gameServiceMock.getDeployCountdownValue).toHaveBeenCalledTimes(1);
    expect(gameServiceMock.getGame).toHaveBeenCalledTimes(2);
    expect(authServiceMock.getAuth).toHaveBeenCalledTimes(1);
    expect(playerServiceMock.arePlayersDeployed).toHaveBeenCalledTimes(2);
    expect(routerMock.navigate).toHaveBeenCalledWith(['play-game']);
  });

  it('ngOnInit_OnNotDeployedPlayers_CallsTwoOtherMethods', () => {
    const spy: any = TestBed.inject(GameService);
    spy.gameStateChange = Observable.of({
      players: [
        { isDeployed: true } as Player,
        { isDeployed: false } as Player,
      ],
    } as GameState);
    gameServiceMock.isGameSinglePlayer.and.returnValue(false);
    playerServiceMock.findComputerPlayerNumber.and.returnValue(0);
    playerServiceMock.arePlayersDeployed.and.returnValue(false);
    gameServiceMock.isGameStarted.and.returnValue(true);
    authServiceMock.getAuth.and.returnValue({
      user: 'any_user',
    } as LoginResponse);
    component.ngOnInit();

    expect(playerServiceMock.findComputerPlayerNumber).toHaveBeenCalledTimes(2);
    expect(gameServiceMock.isGameSinglePlayer).toHaveBeenCalledTimes(2);
  });

  it('deployShip_OnDropAndDeploymentNotAllowed_CallsNeverTwoServiceMethods', () => {
    boardServiceMock.verifyHoveredElement.and.returnValue(false);
    component.isDeploymentAllowed = false;
    (boardServiceMock as any).getPlayersBoard = [[]];
    (fleetServiceMock as any).getFleetWaiting = [];
    (fleetServiceMock as any).getFleetDeployed = [];
    component.deployShip(0, 3);

    expect(fleetServiceMock.moveFromWaitingToDeployed).toHaveBeenCalledTimes(0);
    expect(boardServiceMock.deployShipOnBoard).toHaveBeenCalledTimes(0);
    expect(gameServiceMock.shouldBeDeployEnabled).toHaveBeenCalledTimes(1);
  });

  it('deployShip_OnDropNotAllowed_CallsNeverTwoServiceMethods', () => {
    boardServiceMock.verifyHoveredElement.and.returnValue(false);
    component.isDeploymentAllowed = true;
    (boardServiceMock as any).getPlayersBoard = [[]];
    (fleetServiceMock as any).getFleetWaiting = [];
    (fleetServiceMock as any).getFleetDeployed = [];
    component.deployShip(0, 3);

    expect(fleetServiceMock.moveFromWaitingToDeployed).toHaveBeenCalledTimes(0);
    expect(boardServiceMock.deployShipOnBoard).toHaveBeenCalledTimes(0);
    expect(gameServiceMock.shouldBeDeployEnabled).toHaveBeenCalledTimes(1);
  });

  it('deployShip_OnDeploymentNotAllowed_CallsNeverTwoServiceMethods', () => {
    boardServiceMock.verifyHoveredElement.and.returnValue(true);
    component.isDeploymentAllowed = false;
    (boardServiceMock as any).getPlayersBoard = [[]];
    (fleetServiceMock as any).getFleetWaiting = [];
    (fleetServiceMock as any).getFleetDeployed = [];
    component.deployShip(0, 3);

    expect(fleetServiceMock.moveFromWaitingToDeployed).toHaveBeenCalledTimes(0);
    expect(boardServiceMock.deployShipOnBoard).toHaveBeenCalledTimes(0);
    expect(gameServiceMock.shouldBeDeployEnabled).toHaveBeenCalledTimes(1);
  });

  it('deployShip_OnDropAndDeploymentAllowed_CallsTwoServiceMethods', () => {
    boardServiceMock.verifyHoveredElement.and.returnValue(true);
    component.isDeploymentAllowed = true;
    (boardServiceMock as any).getPlayersBoard = [[]];
    (fleetServiceMock as any).getFleetWaiting = [];
    (fleetServiceMock as any).getFleetDeployed = [];
    component.deployShip(0, 3);

    expect(fleetServiceMock.moveFromWaitingToDeployed).toHaveBeenCalledTimes(1);
    expect(boardServiceMock.deployShipOnBoard).toHaveBeenCalledTimes(1);
    expect(gameServiceMock.shouldBeDeployEnabled).toHaveBeenCalledTimes(1);
  });

  it('checkHoveredElement_OnDropAndDeploymentNotAllowed_NeverCallsSecondServiceMethod', () => {
    boardServiceMock.verifyHoveredElement.and.returnValue(false);
    component.isDeploymentAllowed = false;
    (boardServiceMock as any).getPlayersBoard = [[]];
    (fleetServiceMock as any).getFleetWaiting = [];
    (fleetServiceMock as any).getFleetDeployed = [];
    let dummyHtmlElement: HTMLElement = document.createElement('DIV');
    component.checkHoveredElement(0, 3, dummyHtmlElement);

    expect(boardServiceMock.getShipsDropCells).toHaveBeenCalledTimes(1);
    expect(boardServiceMock.updateHoveredElements).toHaveBeenCalledTimes(0);
  });

  it('checkHoveredElement_OnDropNotAllowed_NeverCallsSecondServiceMethod', () => {
    boardServiceMock.verifyHoveredElement.and.returnValue(false);
    component.isDeploymentAllowed = true;
    (boardServiceMock as any).getPlayersBoard = [[]];
    (fleetServiceMock as any).getFleetWaiting = [];
    (fleetServiceMock as any).getFleetDeployed = [];
    let dummyHtmlElement: HTMLElement = document.createElement('DIV');
    component.checkHoveredElement(0, 3, dummyHtmlElement);

    expect(boardServiceMock.getShipsDropCells).toHaveBeenCalledTimes(1);
    expect(boardServiceMock.updateHoveredElements).toHaveBeenCalledTimes(0);
  });

  it('checkHoveredElement_OnDeploymentNotAllowed_NeverCallsSecondServiceMethod', () => {
    boardServiceMock.verifyHoveredElement.and.returnValue(true);
    component.isDeploymentAllowed = false;
    (boardServiceMock as any).getPlayersBoard = [[]];
    (fleetServiceMock as any).getFleetWaiting = [];
    (fleetServiceMock as any).getFleetDeployed = [];
    let dummyHtmlElement: HTMLElement = document.createElement('DIV');
    component.checkHoveredElement(0, 3, dummyHtmlElement);

    expect(boardServiceMock.getShipsDropCells).toHaveBeenCalledTimes(1);
    expect(boardServiceMock.updateHoveredElements).toHaveBeenCalledTimes(0);
  });

  it('checkHoveredElement_OnDropAndDeploymentAllowed_CallsTwoServiceMethods', () => {
    boardServiceMock.verifyHoveredElement.and.returnValue(true);
    component.isDeploymentAllowed = true;
    (boardServiceMock as any).getPlayersBoard = [[]];
    (fleetServiceMock as any).getFleetWaiting = [];
    (fleetServiceMock as any).getFleetDeployed = [];
    let dummyHtmlElement: HTMLElement = document.createElement('DIV');
    component.checkHoveredElement(0, 3, dummyHtmlElement);

    expect(boardServiceMock.getShipsDropCells).toHaveBeenCalledTimes(2);
    expect(boardServiceMock.updateHoveredElements).toHaveBeenCalledTimes(1);
  });

  it('confirm_OnFleetArrayLength10AndNotDeployedPlayer_CallsBroadcastGame', () => {
    (fleetServiceMock as any).getFleetDeployed = [
      {} as ShipComponent,
      {} as ShipComponent,
      {} as ShipComponent,
      {} as ShipComponent,
      {} as ShipComponent,
      {} as ShipComponent,
      {} as ShipComponent,
      {} as ShipComponent,
      {} as ShipComponent,
      {} as ShipComponent,
    ];
    gameServiceMock.isPlayerDeployed.and.returnValue(false);
    playerServiceMock.getPlayerNumber.and.returnValue(0);
    gameServiceMock.getGame.and.returnValue({
      players: [
        { isDeployed: false } as Player,
        { isDeployed: false } as Player,
      ],
    } as GameState);
    component.confirm();

    expect(signalrServiceMock.broadcastGameState).toHaveBeenCalledTimes(1);
    expect(signalrServiceMock.broadcastChatMessage).toHaveBeenCalledTimes(1);
  });

  it('confirm_OnFleetArrayLengthLessThan10AndNotDeployedPlayer_CallsNeverBroadcastGame', () => {
    (fleetServiceMock as any).getFleetDeployed = [{} as ShipComponent];
    gameServiceMock.isPlayerDeployed.and.returnValue(false);
    playerServiceMock.getPlayerNumber.and.returnValue(0);
    gameServiceMock.getGame.and.returnValue({
      players: [
        { isDeployed: false } as Player,
        { isDeployed: false } as Player,
      ],
    } as GameState);
    component.confirm();

    expect(signalrServiceMock.broadcastGameState).toHaveBeenCalledTimes(0);
    expect(signalrServiceMock.broadcastChatMessage).toHaveBeenCalledTimes(0);
  });

  it('confirm_OnFleetArrayLength10DeployedPlayer_CallsNeverBroadcastGame', () => {
    (fleetServiceMock as any).getFleetDeployed = [
      {} as ShipComponent,
      {} as ShipComponent,
      {} as ShipComponent,
      {} as ShipComponent,
      {} as ShipComponent,
      {} as ShipComponent,
      {} as ShipComponent,
      {} as ShipComponent,
      {} as ShipComponent,
      {} as ShipComponent,
    ];
    gameServiceMock.isPlayerDeployed.and.returnValue(true);
    playerServiceMock.getPlayerNumber.and.returnValue(0);
    gameServiceMock.getGame.and.returnValue({
      players: [
        { isDeployed: false } as Player,
        { isDeployed: false } as Player,
      ],
    } as GameState);
    component.confirm();

    expect(signalrServiceMock.broadcastGameState).toHaveBeenCalledTimes(0);
    expect(signalrServiceMock.broadcastChatMessage).toHaveBeenCalledTimes(0);
  });

  it('confirm_OnFleetArrayLengthLessThan10AndDeployedPlayer_CallsNeverBroadcastGame', () => {
    (fleetServiceMock as any).getFleetDeployed = [{} as ShipComponent];
    gameServiceMock.isPlayerDeployed.and.returnValue(true);
    playerServiceMock.getPlayerNumber.and.returnValue(0);
    gameServiceMock.getGame.and.returnValue({
      players: [
        { isDeployed: false } as Player,
        { isDeployed: false } as Player,
      ],
    } as GameState);
    component.confirm();

    expect(signalrServiceMock.broadcastGameState).toHaveBeenCalledTimes(0);
    expect(signalrServiceMock.broadcastChatMessage).toHaveBeenCalledTimes(0);
  });

  it('ngOnInit_OnDeploymentAlloweOrPlayerNotDeployed_StartsCountdown', fakeAsync(() => {
    gameServiceMock.isGameStarted.and.returnValue(true);
    gameServiceMock.isPlayerDeployed.and.returnValue(false);
    playerServiceMock.arePlayersDeployed.and.returnValue(true);
    gameServiceMock.getGameSpeedDivider.and.returnValue(1);
    gameServiceMock.getGame.and.returnValue({
      isDeploymentAllowed: true,
    } as GameState);
    gameServiceMock.getDeployCountdownValue.and.returnValue(31);
    const spy: any = TestBed.inject(GameService);
    spy.gameStateChange = Observable.of({} as GameState);
    authServiceMock.getAuth.and.returnValue({
      user: 'any_user',
    } as LoginResponse);
    component.ngOnInit();
    tick(1000);
    discardPeriodicTasks();
    component.ngOnDestroy;
    expect(component.count).toBe(29);
  }));

  it('ngOnInit_OnDeploymentNotAlloweOrPlayerDeployed_ResetsCountValue', fakeAsync(() => {
    gameServiceMock.isGameStarted.and.returnValue(true);
    gameServiceMock.isPlayerDeployed.and.returnValue(true);
    playerServiceMock.arePlayersDeployed.and.returnValue(true);
    gameServiceMock.getGameSpeedDivider.and.returnValue(1);
    gameServiceMock.getGame.and.returnValue({
      isDeploymentAllowed: false,
    } as GameState);
    gameServiceMock.getDeployCountdownValue.and.returnValue(31);
    const spy: any = TestBed.inject(GameService);
    spy.gameStateChange = Observable.of({} as GameState);
    authServiceMock.getAuth.and.returnValue({
      user: 'any_user',
    } as LoginResponse);
    component.ngOnInit();
    tick(1000);
    discardPeriodicTasks();
    component.ngOnDestroy;
    expect(component.count).toBe(180);
  }));
});
