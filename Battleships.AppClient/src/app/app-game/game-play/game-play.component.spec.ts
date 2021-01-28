import { GamePlayComponent } from './game-play.component';
import { SignalRService } from '@services/signal-r.service';
import { BoardService } from '@services/board.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameService } from '@services/game.service';
import { AuthService } from '@services/auth.service';
import { AiService } from '@services/ai.service';
import { PlayerService } from '@services/player.service';
import { FormsModule } from '@angular/forms';
import { HttpService } from '@services/http.service';
import { CommentsService } from '@services/comments.service';
import { ModalService } from '@services/modal.service';

let component: GamePlayComponent;
let fixture: ComponentFixture<GamePlayComponent>;
const routerMock = jasmine.createSpyObj('Router', ['navigate']);
const aiServiceMock = jasmine.createSpyObj('AiService', ['getFireCoordinates']);
const gameServiceMock = jasmine.createSpyObj('GameService', [
  'isGameStarted',
  'getGameSpeedDivider',
  'getDeployCountdownValue',
  'getGame',
  'isGameSinglePlayer',
  'shouldBeDeployEnabled',
  'gameStateChange',
  'isPlayerDeployed',
  'getGameId',
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
const httpServiceMock = jasmine.createSpyObj('HttpService', ['postGameState']);
const commentsServiceMock = jasmine.createSpyObj('CommentsService', [
  'getWaitingComment',
  'getYourTurnComment',
  'getOpponentsTurnComment',
  'getInitialComment',
]);
const modalServiceMock = jasmine.createSpyObj('ServiceMock', ['add', 'remove']);

describe('GamePlayComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [GamePlayComponent],
      providers: [
        { provide: ModalService, useValue: modalServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: CommentsService, useValue: commentsServiceMock },
        { provide: HttpService, useValue: httpServiceMock },
        { provide: GameService, useValue: gameServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: BoardService, useValue: boardServiceMock },
        { provide: AiService, useValue: aiServiceMock },
        { provide: SignalRService, useValue: signalrServiceMock },
        { provide: PlayerService, useValue: playerServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GamePlayComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });
});
