import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameMenuComponent } from './game-menu.component';

let component: GameMenuComponent;
let fixture: ComponentFixture<GameMenuComponent>;

describe('GameMenuComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [GameMenuComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(GameMenuComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });
});
