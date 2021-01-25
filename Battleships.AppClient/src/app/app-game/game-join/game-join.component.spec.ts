import { GameState } from './../../app-core/_models/game-state.model';
import { GameJoinComponent } from './game-join.component';
import { HttpService } from '@services/http.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameService } from '@services/game.service';
import { of } from 'rxjs';
import { OpenGames } from '@models/open-games.model';

let game: GameState;
let component: GameJoinComponent;
let fixture: ComponentFixture<GameJoinComponent>;
const routerMock = jasmine.createSpyObj('Router', ['navigate']);
const httpServiceMock = jasmine.createSpyObj('HttpService', ['getOpenGames']);
const gameServiceMock = jasmine.createSpyObj('GameService', [
  'isGameStarted',
  'getGame',
  'getGameId',
]);

describe('GameJoinComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [GameJoinComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: GameService, useValue: gameServiceMock },
        { provide: HttpService, useValue: httpServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameJoinComponent);
    component = fixture.componentInstance;
    game = { gameId: 1 } as GameState;
    gameServiceMock.getGame.and.returnValue(game);
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit_OnGameStarted_SetsCurrentGameId', () => {
    gameServiceMock.getGameId.and.returnValue(1);
    gameServiceMock.isGameStarted.and.returnValue(true);
    httpServiceMock.getOpenGames.and.returnValue(of([]));
    component.ngOnInit();

    expect(component.currentGameId).toBe(1);
  });

  it('ngOnInit_OnGameNotStarted_SetsCurrentGameIdToZero', () => {
    gameServiceMock.isGameStarted.and.returnValue(false);
    httpServiceMock.getOpenGames.and.returnValue(of([]));
    component.ngOnInit();

    expect(component.currentGameId).toBe(0);
  });

  it('ngOnInit_OnNoGamesFound_SetsNoteToProperStringAndShowsNoTable', () => {
    gameServiceMock.isGameStarted.and.returnValue(false);
    httpServiceMock.getOpenGames.and.returnValue(of([]));
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.note).toBe('No games found!');
    expect(fixture.nativeElement.querySelector('.table')).toBeNull();
    expect(fixture.nativeElement.querySelector('.noteDisplay')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.noteDisplay').innerHTML).toBe(
      'No games found!'
    );
  });

  it('ngOnInit_OnGamesFound_SetsNoteToProperString', () => {
    gameServiceMock.isGameStarted.and.returnValue(false);
    httpServiceMock.getOpenGames.and.returnValue(of([{} as OpenGames]));
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.note).toBe('Found games.');
    expect(fixture.nativeElement.querySelector('.table')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.noteDisplay')).toBeNull();
  });

  it('template_OnEmptyGameSlot_DisplaysEmptyMessage', () => {
    gameServiceMock.isGameStarted.and.returnValue(false);
    httpServiceMock.getOpenGames.and.returnValue(
      of([{ players: ['one', ''], gameId: 2 } as OpenGames])
    );
    component.ngOnInit();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.greenColor').innerHTML
    ).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.playing-now-msg')).toBeNull();
  });

  it('template_OnCurrentGameIdSameLikePlayed_DisplaysPlayingNowMessage', () => {
    gameServiceMock.isGameStarted.and.returnValue(true);
    gameServiceMock.getGameId.and.returnValue(1);
    httpServiceMock.getOpenGames.and.returnValue(
      of([{ players: ['one', ''], gameId: 1 } as OpenGames])
    );
    component.ngOnInit();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.playing-now-msg')
    ).toBeTruthy();
  });

  it('template_OnEmptyGameSlots_DisplaysPlayBtnMessage', () => {
    gameServiceMock.isGameStarted.and.returnValue(true);
    httpServiceMock.getOpenGames.and.returnValue(
      of([
        {
          players: ['one', ''],
          gameId: 1,
          totalPlayers: 2,
          playing: 1,
        } as OpenGames,
      ])
    );
    component.currentGameId = 1;
    component.ngOnInit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.play-now-btn')).toBeTruthy();
  });

  it('template_OnFullGameSlots_NotDisplaysPlayBtnMessage', () => {
    gameServiceMock.getGameId.and.returnValue(1);
    gameServiceMock.isGameStarted.and.returnValue(true);
    httpServiceMock.getOpenGames.and.returnValue(
      of([
        {
          players: ['one', 'two'],
          gameId: 1,
          totalPlayers: 2,
          playing: 2,
        } as OpenGames,
      ])
    );
    component.currentGameId = 1;
    component.ngOnInit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.play-now-btn')).toBeNull();
  });
});
