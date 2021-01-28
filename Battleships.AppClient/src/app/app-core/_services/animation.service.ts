import { Injectable } from '@angular/core';
import { Sprite } from '@models/sprite.model';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class AnimationService {
  constructor() {}

  public checkForInterval(elapsed: number, frameInterval: number): boolean {
    return elapsed > frameInterval;
  }

  public isAnimationElapsed(
    totalFrames: number,
    currentFrame: number
  ): boolean {
    return totalFrames <= currentFrame;
  }

  public stopAnimation(stop: boolean) {
    return stop;
  }

  public createNewSprite(frame: number): Sprite {
    return {
      currentFrame: frame,
      directionX: 0,
      directionY: 0,
      positionX: 0,
      positionY: 0,
      stopped: false,
    } as Sprite;
  }

  public updateSpriteOnStopped(sprite: Sprite): Sprite {
    sprite.stopped = true;
    return sprite;
  }

  public updateSpriteCurrentFrame(sprite: Sprite): Sprite {
    sprite.currentFrame++;
    return sprite;
  }

  public loadImage(url: string): Observable<HTMLImageElement> {
    let subject = new Subject<any>();
    const image = new Image();
    image.src = url;
    image.onload = () => {
      subject.next(image);
    };

    return subject.asObservable();
  }

  public updateSpriteFrameOnPosition(
    sprite: Sprite,
    imgSize: { width: number; height: number },
    spriteWidth: number,
    spriteHeight: number
  ): Sprite {
    if (Math.abs(sprite.positionY) > imgSize.height) {
      console.log('1');
      sprite.directionX = 0;
      sprite.directionY = 0;
      sprite.positionX = sprite.directionX * spriteWidth;
      sprite.positionY = sprite.directionY * spriteHeight;
    } else if (Math.abs(sprite.positionX) > imgSize.width - 300) {
      console.log('2');
      sprite.directionX = 0;
      sprite.directionY -= 1;
      sprite.positionX = 0;
      sprite.positionY = sprite.directionY * spriteHeight;
    } else {
      console.log('3');
      sprite.directionX -= 1;
      sprite.positionX = sprite.directionX * spriteWidth;
    }

    return sprite;
  }
}
