import { LoginResponse } from '@models/login-response.model';
import { SignalRService } from '@services/signal-r.service';
import { FleetService } from '@services/fleet.service';
import { BoardService } from '@services/board.service';
import { GameDeployComponent } from './game-deploy-ships.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpService } from '@services/http.service';
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
]);
const authServiceMock = jasmine.createSpyObj('AuthService', ['getAuth']);
const boardServicemock = jasmine.createSpyObj('BoardService', [
  'resetAvoidCellsArray',
  'getEmptyBoard',
  'deployShipOnBoard',
  'getShipsDropCells',
  'resetBoardElement',
  'getShipsDropCells',
  'updateHoveredElements',
  'verifyHoveredElement',
]);
const fleetServicemock = jasmine.createSpyObj('FleetService', [
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
  'messageChange',
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
      imports: [],
      declarations: [
        GameDeployComponent,
        GameSetupComponent,
        GameChatComponent,
      ],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: GameService, useValue: gameServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: BoardService, useValue: boardServicemock },
        { provide: FleetService, useValue: fleetServicemock },
        { provide: AiService, useValue: aiServiceMock },
        { provide: TextService, useValue: textServiceMock },
        { provide: SignalRService, useValue: signalrServiceMock },
        { provide: PlayerService, useValue: playerServiceMock },
      ],
    }).compileComponents();
    gameServiceMock.getGame.and.returnValue({ gameId: 666 } as GameState);
    boardServicemock.resetAvoidCellsArray.calls.reset();
    boardServicemock.getEmptyBoard.calls.reset();
    gameServiceMock.getGameSpeedDivider.calls.reset();
    gameServiceMock.getDeployCountdownValue.calls.reset();
    gameServiceMock.getGame.calls.reset();
    authServiceMock.getAuth.calls.reset();
    playerServiceMock.arePlayersDeployed.calls.reset();
    routerMock.navigate.calls.reset();
    playerServiceMock.findComputerPlayerNumber.calls.reset();
    gameServiceMock.isGameSinglePlayer.calls.reset();

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

    expect(boardServicemock.resetAvoidCellsArray).toHaveBeenCalledTimes(1);
    expect(boardServicemock.getEmptyBoard).toHaveBeenCalledTimes(1);
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
});
