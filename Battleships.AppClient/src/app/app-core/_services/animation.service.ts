import { Injectable } from '@angular/core';

@Injectable()
export class AnimationService {
  constructor() {}

  //todo: unit test

  public checkForElapsed(elapsed: number, frameInterval: number): boolean {
    return elapsed > frameInterval;
  }

  public checkForTotalFrames(
    totalFrames: number,
    currentFrame: number
  ): boolean {
    return totalFrames <= currentFrame;
  }
}
