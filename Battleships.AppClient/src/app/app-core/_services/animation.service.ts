import { Injectable } from '@angular/core';

@Injectable()
export class AnimationService {
  constructor() {}

  //todo: unit test

  public checkForElapsed(elapsed: number, frameInterval: number): boolean {
    return elapsed > frameInterval;
  }

  public isAnimationEnded(totalFrames: number, currentFrame: number): boolean {
    return totalFrames <= currentFrame;
  }

  public stopAnimation(stop: boolean) {
    return stop;
  }
}
