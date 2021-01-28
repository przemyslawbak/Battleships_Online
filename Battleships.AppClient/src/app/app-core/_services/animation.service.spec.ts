import { Sprite } from '@models/sprite.model';
import { AnimationService } from './animation.service';

describe('CommentsService', () => {
  let service: AnimationService;

  beforeEach(() => {
    service = new AnimationService();
  });

  it('Service_ShouldBeCreated', () => {
    expect(service).toBeTruthy();
  });

  it('updateSpriteFrameOnPosition_OnPositionYExceeded_ResetsPositionsXY&DirectionXYTo0', () => {
    let sprite: Sprite = {
      currentFrame: 0,
      directionX: 1,
      directionY: 110,
      positionX: 4,
      positionY: 501,
      elapsed: 0,
      stopped: false,
    } as Sprite;

    let result = service.updateSpriteFrameOnPosition(
      sprite,
      { width: 500, height: 500 },
      5,
      5
    );

    expect(result.directionX).toBe(0);
    expect(result.directionY).toBe(0);
    expect(result.positionX).toBe(0);
    expect(result.positionY).toBe(0);
  });

  it('updateSpriteFrameOnPosition_OnPositionYExceeded_ResetsPositionsX&DirectionXTo0', () => {
    let sprite: Sprite = {
      currentFrame: 0,
      directionX: 15,
      directionY: 11,
      positionX: 201,
      positionY: 100,
      elapsed: 0,
      stopped: false,
    } as Sprite;

    let result = service.updateSpriteFrameOnPosition(
      sprite,
      { width: 500, height: 500 },
      5,
      5
    );

    expect(result.directionX).toBe(0);
    expect(result.directionY).toBe(10);
    expect(result.positionX).toBe(0);
    expect(result.positionY).toBe(50);
  });

  it('updateSpriteFrameOnPosition_OnPositionXYNotExceedingValues_ResetsNothingTo0', () => {
    let sprite: Sprite = {
      currentFrame: 0,
      directionX: 15,
      directionY: 11,
      positionX: 30,
      positionY: 100,
      elapsed: 0,
      stopped: false,
    } as Sprite;

    let result = service.updateSpriteFrameOnPosition(
      sprite,
      { width: 500, height: 500 },
      5,
      5
    );

    expect(result.directionX).toBe(14);
    expect(result.directionY).toBe(11);
    expect(result.positionX).toBe(70);
    expect(result.positionY).toBe(100);
  });
});
