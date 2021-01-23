import { GameState } from '@models/game-state.model';
import { GameSetupComponent } from './game-setup.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameService } from '@services/game.service';

let component: GameSetupComponent;
let fixture: ComponentFixture<GameSetupComponent>;
const gameServiceMock = jasmine.createSpyObj('GameService', ['getGame']);

describe('GameSetupComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [GameSetupComponent],
      providers: [{ provide: GameService, useValue: gameServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(GameSetupComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit_OnGameSingleplayerValue_SetsFirstLetterTuUpperCase', () => {
    let game: GameState = {
      gameDifficulty: 'hard',
      gameMulti: false,
    } as GameState;
    gameServiceMock.getGame.and.returnValue(game);
    component.ngOnInit();

    expect(component.gameDifficulty).toBe('Hard');
  });

  it('ngOnInit_OnGameMultiplayerValue_SetsItNA', () => {
    let game: GameState = {
      gameDifficulty: 'hard',
      gameMulti: true,
    } as GameState;
    gameServiceMock.getGame.and.returnValue(game);
    component.ngOnInit();

    expect(component.gameDifficulty).toBe('n/a');
  });

  it('ngOnInit_OnGameSpeedDividerOne_SetsPropToSlow', () => {
    let game: GameState = {
      gameSpeedDivider: 1,
      gameMulti: true,
    } as GameState;
    gameServiceMock.getGame.and.returnValue(game);
    component.ngOnInit();

    expect(component.gameSpeed).toBe('Slow');
  });

  it('ngOnInit_OnGameSpeedDividerTwo_SetsPropToModerate', () => {
    let game: GameState = {
      gameSpeedDivider: 2,
      gameMulti: true,
    } as GameState;
    gameServiceMock.getGame.and.returnValue(game);
    component.ngOnInit();

    expect(component.gameSpeed).toBe('Moderate');
  });

  it('ngOnInit_OnGameSpeedDividerThree_SetsPropToFast', () => {
    let game: GameState = {
      gameSpeedDivider: 3,
      gameMulti: true,
    } as GameState;
    gameServiceMock.getGame.and.returnValue(game);
    component.ngOnInit();

    expect(component.gameSpeed).toBe('Fast');
  });

  it('ngOnInit_OnGameModeMultiplayer_SetsCorrectProp', () => {
    let game: GameState = {
      gameDifficulty: 'hard',
      gameMulti: true,
    } as GameState;
    gameServiceMock.getGame.and.returnValue(game);
    component.ngOnInit();

    expect(component.gameMode).toBe('Multi player');
  });

  it('ngOnInit_OnGameModeSinglePlayer_SetsCorrectPropAndJoiningNA', () => {
    let game: GameState = {
      gameDifficulty: 'hard',
      gameMulti: false,
    } as GameState;
    gameServiceMock.getGame.and.returnValue(game);
    component.ngOnInit();

    expect(component.gameMode).toBe('Single player');
    expect(component.gameJoining).toBe('n/a');
  });

  it('ngOnInit_OnGameJoiningOpen_SetsCorrectPropToOpen', () => {
    let game: GameState = {
      gameDifficulty: 'hard',
      gameMulti: true,
      gameOpen: true,
    } as GameState;
    gameServiceMock.getGame.and.returnValue(game);
    component.ngOnInit();

    expect(component.gameJoining).toBe('Open for all');
  });

  it('ngOnInit_OnGameJoiningNotOpen_SetsCorrectPropToLinkOnly', () => {
    let game: GameState = {
      gameDifficulty: 'hard',
      gameMulti: true,
      gameOpen: false,
    } as GameState;
    gameServiceMock.getGame.and.returnValue(game);
    component.ngOnInit();

    expect(component.gameJoining).toBe('Join by link only');
  });
});
