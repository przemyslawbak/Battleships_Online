import { GameState } from '@models/game-state.model';
import { HttpService } from '@services/http.service';
import { GameConnectComponent } from './game-connect.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
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
            snapshot: { paramMap: convertToParamMap({ id: '666' }) },
          },
        },
        { provide: GameService, useValue: gameServiceMock },
        { provide: HttpService, useValue: httpServiceMock },
        { provide: GameInitializerService, useValue: initializerServiceMock },
      ],
    }).compileComponents();

    httpServiceMock.getGameState.calls.reset();
  });

  it('Component_ShouldBeCreated', () => {
    fixture = TestBed.createComponent(GameConnectComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('ngOnInit_OnIdNull_CallsGameServiceOnce', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: {
        snapshot: { paramMap: convertToParamMap({ id: null }) },
      },
    });
    fixture = TestBed.createComponent(GameConnectComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(gameServiceMock.findIdAndReconnect).toHaveBeenCalledTimes(1);
  });

  it('ngOnInit_OnIdTruthly_CallsHttpService', () => {
    fixture = TestBed.createComponent(GameConnectComponent);
    component = fixture.componentInstance;
    let game: GameState = null;
    httpServiceMock.getGameState.and.returnValue(of(game));
    component.ngOnInit();

    expect(httpServiceMock.getGameState).toHaveBeenCalledTimes(1);
  });

  it('ngOnInit_OnIdAndGameTruthly_CallsGameServiceMethodsAndInitializer', () => {
    fixture = TestBed.createComponent(GameConnectComponent);
    component = fixture.componentInstance;
    let game: GameState = {} as GameState;
    httpServiceMock.getGameState.and.returnValue(of(game));
    component.ngOnInit();

    expect(httpServiceMock.getGameState).toHaveBeenCalledTimes(1);
    expect(gameServiceMock.getUsersNames).toHaveBeenCalledTimes(1);
    expect(gameServiceMock.isGameAlreadyPlayed).toHaveBeenCalledTimes(1);
    expect(gameServiceMock.isGameMultiplayer).toHaveBeenCalledTimes(1);
    expect(gameServiceMock.checkForEmptySlots).toHaveBeenCalledTimes(1);
    expect(initializerServiceMock.initGame).toHaveBeenCalledTimes(1);
  });
});
