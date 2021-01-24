import { GameSpriteComponent } from './game-sprite.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimationService } from '@services/animation.service';
import { Sprite } from '@models/sprite.model';
import { of } from 'rxjs';

let component: GameSpriteComponent;
let fixture: ComponentFixture<GameSpriteComponent>;
let animationServiceMock = jasmine.createSpyObj('AnimationService', [
  'createNewSprite',
  'stopAnimation',
  'checkForInterval',
  'isAnimationElapsed',
  'updateSpriteOnStopped',
  'updateSpriteCurrentFrame',
  'updateSpriteFrameOnPosition',
  'loadImage',
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

    animationServiceMock.checkForInterval.calls.reset();
    animationServiceMock.isAnimationElapsed.calls.reset();
    animationServiceMock.updateSpriteOnStopped.calls.reset();
    animationServiceMock.updateSpriteFrameOnPosition.calls.reset();
    animationServiceMock.updateSpriteCurrentFrame.calls.reset();
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });

  it('ngAfterViewInit_OnAnimationStopped_NeverCallsSomeMethods', () => {
    animationServiceMock.loadImage.and.returnValue(of(new Image()));
    let returnedSprite: Sprite = {} as Sprite;
    animationServiceMock.createNewSprite.and.returnValue(returnedSprite);
    animationServiceMock.stopAnimation.and.returnValue(true);
    component.ngAfterViewInit();

    expect(animationServiceMock.checkForInterval).toHaveBeenCalledTimes(0);
    expect(animationServiceMock.isAnimationElapsed).toHaveBeenCalledTimes(0);
  });

  it('ngAfterViewInit_OnAnimationNotStopped_CallsOnlyCheckForIntervalMethodOnce', () => {
    animationServiceMock.loadImage.and.returnValue(of(new Image()));
    let returnedSprite: Sprite = {} as Sprite;
    animationServiceMock.createNewSprite.and.returnValue(returnedSprite);
    animationServiceMock.stopAnimation.and.returnValue(false);
    animationServiceMock.checkForInterval.and.returnValue(false);
    component.ngAfterViewInit();

    expect(animationServiceMock.checkForInterval).toHaveBeenCalledTimes(1);
    expect(animationServiceMock.isAnimationElapsed).toHaveBeenCalledTimes(0);
    fixture.detectChanges();
    animationServiceMock.stopAnimation.and.returnValue(true);
  });

  it('ngAfterViewInit_OnIntervalTrue_CallsIsAnimationElapsedOnce', () => {
    animationServiceMock.loadImage.and.returnValue(of(new Image()));
    let returnedSprite: Sprite = { stopped: false } as Sprite;
    animationServiceMock.createNewSprite.and.returnValue(returnedSprite);
    animationServiceMock.updateSpriteOnStopped.and.returnValue(returnedSprite);
    animationServiceMock.updateSpriteFrameOnPosition.and.returnValue(
      returnedSprite
    );
    animationServiceMock.stopAnimation.and.returnValue(false);
    animationServiceMock.checkForInterval.and.returnValue(true);
    animationServiceMock.isAnimationElapsed.and.returnValue(true);
    component.ngAfterViewInit();

    expect(animationServiceMock.checkForInterval).toHaveBeenCalledTimes(1);
    expect(animationServiceMock.isAnimationElapsed).toHaveBeenCalledTimes(1);
    expect(animationServiceMock.updateSpriteOnStopped).toHaveBeenCalledTimes(1);
    expect(
      animationServiceMock.updateSpriteFrameOnPosition
    ).toHaveBeenCalledTimes(1);
    expect(animationServiceMock.updateSpriteOnStopped).toHaveBeenCalledTimes(1);
    expect(animationServiceMock.updateSpriteCurrentFrame).toHaveBeenCalledTimes(
      0
    );
    fixture.detectChanges();
    animationServiceMock.stopAnimation.and.returnValue(true);
  });
});
