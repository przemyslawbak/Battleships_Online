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
  'getGame',
  'getGame',
  'getGame',
  'getGame',
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
const aiServiceMock = jasmine.createSpyObj('AiService', ['autoDeploy']);
const textServiceMock = jasmine.createSpyObj('TextService', [
  'getIdFromElementName',
  'getFacebookShareLink',
  'copyLink',
]);
const signalrServiceMock = jasmine.createSpyObj('SignalRService', [
  'broadcastChatMessage',
  'messageChange',
]);
const playerServiceMock = jasmine.createSpyObj('PlayerService', [
  'arePlayersDeployed',
  'getPlayerNumber',
  'setComputerPlayerOpponent',
]);

describe('GameDeployComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [GameDeployComponent],
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

    fixture = TestBed.createComponent(GameDeployComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });
});
