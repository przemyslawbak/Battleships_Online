import { GameSpriteComponent } from './game-sprite.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimationService } from '@services/animation.service';

let component: GameSpriteComponent;
let fixture: ComponentFixture<GameSpriteComponent>;
let animationServiceMock = jasmine.createSpyObj('AnimationService', [
  'checkForTotalFrames',
  'checkForElapsed',
]);

describe('GameSpriteComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: AnimationService, useValue: animationServiceMock },
      ],
      declarations: [GameSpriteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameSpriteComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });
});
