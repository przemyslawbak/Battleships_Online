export interface Sprite {
  currentFrame: number;
  directionX: number;
  directionY: number;
  positionX: number;
  positionY: number;
  elapsed: number;
  stopped: boolean;
}
