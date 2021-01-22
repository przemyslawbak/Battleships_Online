import { GameBestComponent } from './game-best.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpService } from '@services/http.service';
import { BestPlayer } from '@models/best-players';
import { of } from 'rxjs';

let component: GameBestComponent;
const httpServiceMock = jasmine.createSpyObj('HttpService', ['getBestPlayers']);
const routerMock = jasmine.createSpyObj('Router', ['navigate']);
let fixture: ComponentFixture<GameBestComponent>;

describe('GameBestComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameBestComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: HttpService, useValue: httpServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameBestComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit_OnEmptyListOfPlayers_DisplaysMessage', () => {
    let players: BestPlayer[] = [];
    httpServiceMock.getBestPlayers.and.returnValue(of(players));
    component.ngOnInit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.table')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('.no-players-message')
    ).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.message-text').innerHTML).toBe(
      'No players found!'
    );
  });

  it('ngOnInit_OnPopulatedListOfPlayers_DisplaysTable', () => {
    let players: BestPlayer[] = [{} as BestPlayer, {} as BestPlayer];
    httpServiceMock.getBestPlayers.and.returnValue(of(players));
    component.ngOnInit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.table')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('.no-players-message')
    ).toBeNull();
    expect(fixture.nativeElement.querySelector('.message-text')).toBeNull();
  });

  it('goBackBtn_OnClick_NavigatesToHomePage', () => {
    let button = fixture.nativeElement.querySelector('.go-back-btn');
    button.click();

    expect(routerMock.navigate).toHaveBeenCalledWith(['']);
  });
});
