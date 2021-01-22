import { HttpService } from '@services/http.service';
import { GameConnectComponent } from './game-connect.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { GameService } from '@services/game.service';
import { GameInitializerService } from '@services/game-initializer.service';

let component: GameConnectComponent;
let fixture: ComponentFixture<GameConnectComponent>;
const gameServiceMock = jasmine.createSpyObj('GameService', [
  'findIdAndReconnect',
  'getUsersNames',
  'isGameAlreadyPlayed',
  'isGameMultiplayer',
  'checkForEmptySlots',
]);
const httpServiceMock = jasmine.createSpyObj('HttpService', ['getGameState']);
const initializerServiceMock = jasmine.createSpyObj('GameInitializerService', [
  'initGame',
]);

describe('GameConnectComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [GameConnectComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: Observable.of({ id: '666' }),
          },
        },
        { provide: GameService, useValue: gameServiceMock },
        { provide: HttpService, useValue: httpServiceMock },
        { provide: GameInitializerService, useValue: initializerServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameConnectComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });
});
