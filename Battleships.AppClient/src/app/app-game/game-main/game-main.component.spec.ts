import { GameMainComponent } from './game-main.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameMenuComponent } from '../game-menu/game-menu.component';

let component: GameMainComponent;
let fixture: ComponentFixture<GameMainComponent>;

describe('GameConnectComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [GameMainComponent, GameMenuComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(GameMainComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });
});
