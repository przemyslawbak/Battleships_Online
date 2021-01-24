import { Sprite } from '@models/sprite.model';
import {
  Component,
  Output,
  Input,
  ElementRef,
  EventEmitter,
  ViewChild,
  OnInit,
} from '@angular/core';
import { AnimationService } from '@services/animation.service';

@Component({
  selector: 'app-animated-sprite',
  templateUrl: './game-sprite.component.html',
  styleUrls: ['./game-sprite.component.css'],
})
export class GameSpriteComponent implements OnInit {
  @ViewChild('animationRef', { static: true }) animationRef: ElementRef;
  constructor(private animation: AnimationService) {}

  @Input() public url: string;
  @Input() public frameRate: number = 17;
  @Input() public totalRows: number = 8;
  @Input() public totalcols: number = 8;
  @Input() public totalFrames: number = 12;
  @Output() public animationFinish = new EventEmitter<boolean>();
  @Input() private frame: number = 0;
  @Input() private isLoop: Boolean = true;
  private frameInterval = 0;
  private startTime = 0;
  private now = 0;
  private then = 0;
  private size = { width: 0, height: 0 };
  public width: number = 5;
  public height: number = 5;
  private stop: boolean = false;
  private sprite: Sprite = {} as Sprite;

  ngOnInit(): void {
    this.sprite = this.createNewSprite();
  }

  ngAfterViewInit(): void {
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

  private createNewSprite(): Sprite {
    return {
      currentFrame: this.frame,
      directionX: 0,
      directionY: 0,
      positionX: 0,
      positionY: 0,
      width: this.width,
      height: this.height,
    } as Sprite;
  }

  public getCssStyle(): string {
    const defaultStyle = 'ani_style';
    return defaultStyle;
  }

  private resetSprite(): void {
    this.sprite = this.createNewSprite();
    this.animationRef.nativeElement.style['background-position-x'] =
      this.sprite.positionX + 'px';
    this.animationRef.nativeElement.style['background-position-y'] =
      this.sprite.positionY + 'px';
  }

  private updateSprite(): void {
    if (
      this.animation.isAnimationEnded(
        this.totalFrames,
        this.sprite.currentFrame
      )
    ) {
      if (this.isLoop) {
        this.resetSprite();
      } else {
        this.stop = true;
        this.animationFinish.emit(true);
        return;
      }
    } else {
      this.sprite.currentFrame++;
    }

    if (Math.abs(this.sprite.positionY) > this.size.height) {
      this.sprite.directionX = 0;
      this.sprite.directionY = 0;
      this.sprite.positionX = this.sprite.directionX * this.width;
      this.sprite.positionY = this.sprite.directionY * this.height;
    } else if (Math.abs(this.sprite.positionX) > this.size.width - 300) {
      this.sprite.directionX = 0;
      this.sprite.directionY -= 1;
      this.sprite.positionX = 0;
      this.sprite.positionY = this.sprite.directionY * this.height;
    } else {
      this.sprite.directionX -= 1;
      this.sprite.positionX = this.sprite.directionX * this.width;
    }
    this.animationRef.nativeElement.style['background-position-x'] =
      this.sprite.positionX + 'px';
    this.animationRef.nativeElement.style['background-position-y'] =
      this.sprite.positionY + 'px';
  }

  private startAnimating(): void {
    this.frameInterval = 1000 / this.frameRate;
    this.then = Date.now();
    this.startTime = this.then;
    this.animate();
  }

  private animate(): void {
    if (this.animation.stopAnimation(this.stop)) {
      return;
    }
    requestAnimationFrame(() => {
      this.animate();
    });
    this.now = Date.now();
    this.sprite.elapsed = this.now - this.then;
    if (
      this.animation.checkForElapsed(this.sprite.elapsed, this.frameInterval)
    ) {
      this.then = this.now - (this.sprite.elapsed % this.frameInterval);
      this.updateSprite();
    }
  }
}
