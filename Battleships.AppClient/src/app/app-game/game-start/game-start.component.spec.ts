import { GameStartComponent } from './game-start.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { HttpService } from '@services/http.service';
import { GameService } from '@services/game.service';
import { AuthService } from '@services/auth.service';
import { BoardService } from '@services/board.service';
import { FleetService } from '@services/fleet.service';
import { RandomizerService } from '@services/randomizer.service';

let component: GameStartComponent;
let fixture: ComponentFixture<GameStartComponent>;
const routerMock = jasmine.createSpyObj('Router', ['navigate']);
const httpServiceMock = jasmine.createSpyObj('HttpService', ['postGameState']);
const gameServiceMock = jasmine.createSpyObj('GameService', [
  'getMultiplayerValue',
  'getSpeedDividerValue',
  'getDifficultyValue',
  'getJoinTypeValue',
]);
const authServiceMock = jasmine.createSpyObj('AuthService', ['getAuth']);
const boardServicemock = jasmine.createSpyObj('BoardService', [
  'getEmptyBoard',
]);
const fleetServicemock = jasmine.createSpyObj('FleetService', ['createFleet']);
const randomServicemock = jasmine.createSpyObj('RandomizerService', [
  'getUniqueId',
]);

describe('GameStartComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [GameStartComponent],
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerMock },
        { provide: HttpService, useValue: httpServiceMock },
        { provide: GameService, useValue: gameServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: BoardService, useValue: boardServicemock },
        { provide: FleetService, useValue: fleetServicemock },
        { provide: RandomizerService, useValue: randomServicemock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameStartComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });
});
