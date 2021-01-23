import { GameRulesComponent } from './game-rules.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

let component: GameRulesComponent;
let fixture: ComponentFixture<GameRulesComponent>;
const routerMock = jasmine.createSpyObj('Router', ['navigate']);

describe('GameRulesComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [GameRulesComponent],
      providers: [{ provide: Router, useValue: routerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(GameRulesComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });
});
