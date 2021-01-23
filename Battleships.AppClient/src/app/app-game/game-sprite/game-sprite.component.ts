import {
  Component,
  Output,
  Input,
  ElementRef,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { AnimationService } from '@services/animation.service';

@Component({
  selector: 'app-animated-sprite',
  templateUrl: './game-sprite.component.html',
  styleUrls: ['./game-sprite.component.css'],
})
export class GameSpriteComponent {
  @ViewChild('animationRef', { static: true }) animationRef: ElementRef;
  constructor(private animation: AnimationService) {}

  @Input() public url: string;
  @Input() public frameRate: number = 17;
  @Input() public totalRows: number = 8;
  @Input() public totalcols: number = 8;
  @Input() public totalFrames: number = 12;
  @Output() public animationFinish = new EventEmitter<boolean>();
  @Input() private currentFrame: number = 0;
  @Input() private isLoop: Boolean = true;
  private frameInterval = 0;
  private startTime = 0;
  private now = 0;
  private then = 0;
  private elapsed = 0;
  private size = { width: 0, height: 0 };
  public width: number = 5;
  public height: number = 5;
  private directionX = 0;
  private directionY = 0;
  private positionX = 0;
  private positionY = 0;
  private stop: boolean = false;

  ngAfterViewInit() {
    const image = new Image();
    image.src = this.url;
    image.onload = () => {
      this.size = {
        width: image.naturalWidth,
        height: image.naturalHeight,
      };
      this.width = this.size.width / this.totalcols;
      this.height = this.size.height / this.totalRows;
      this.startAnimating();
    };
  }

  public getCssStyle(): string {
    const defaultStyle = 'ani_style';
    return defaultStyle;
  }

  private resetSprite(): void {
    this.currentFrame = 0;
    this.directionX = 0;
    this.directionY = 0;
    this.positionX = this.directionX * this.width;
    this.positionY = this.directionY * this.height;
    this.animationRef.nativeElement.style['background-position-x'] =
      this.positionX + 'px';
    this.animationRef.nativeElement.style['background-position-y'] =
      this.positionY + 'px';
  }

  private updateSprite(): void {
    if (
      this.animation.checkForTotalFrames(this.totalFrames, this.currentFrame)
    ) {
      if (this.isLoop) {
        this.resetSprite();
      } else {
        this.stop = true;
        this.animationFinish.emit(true);
        return;
      }
    } else {
      this.currentFrame++;
    }

    if (Math.abs(this.positionY) > this.size.height) {
      this.directionX = 0;
      this.directionY = 0;
      this.positionX = this.directionX * this.width;
      this.positionY = this.directionY * this.height;
    } else if (Math.abs(this.positionX) > this.size.width - 300) {
      this.directionX = 0;
      this.directionY -= 1;
      this.positionX = 0;
      this.positionY = this.directionY * this.height;
    } else {
      this.directionX -= 1;
      this.positionX = this.directionX * this.width;
    }
    this.animationRef.nativeElement.style['background-position-x'] =
      this.positionX + 'px';
    this.animationRef.nativeElement.style['background-position-y'] =
      this.positionY + 'px';
  }

  private startAnimating(): void {
    this.frameInterval = 1000 / this.frameRate;
    this.then = Date.now();
    this.startTime = this.then;
    this.animate();
  }

  private animate(): void {
    if (this.stop) {
      return;
    }
    requestAnimationFrame(() => {
      this.animate();
    });
    this.now = Date.now();
    this.elapsed = this.now - this.then;
    if (this.animation.checkForElapsed(this.elapsed, this.frameInterval)) {
      this.then = this.now - (this.elapsed % this.frameInterval);
      this.updateSprite();
    }
  }
}
