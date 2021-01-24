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
  private frameInterval = 0;
  private now = 0;
  private then = 0;
  private imgSize = { width: 0, height: 0 };
  public spriteWidth: number = 5;
  public spriteHeight: number = 5;
  private sprite: Sprite = {} as Sprite;

  ngOnInit(): void {
    this.sprite = this.animation.createNewSprite(this.frame);
  }

  ngAfterViewInit(): void {
    this.animation.loadImage(this.url).subscribe((image) => {
      this.initAnimation(image);
    });
  }

  private initAnimation(image: HTMLImageElement) {
    this.imgSize = {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
    this.spriteWidth = this.imgSize.width / this.totalcols;
    this.spriteHeight = this.imgSize.height / this.totalRows;
    this.startAnimating();
  }

  private startAnimating(): void {
    this.frameInterval = 1000 / this.frameRate;
    this.then = Date.now();
    this.animate();
  }

  private animate(): void {
    if (this.animation.stopAnimation(this.sprite.stopped)) {
      return;
    }
    requestAnimationFrame(() => {
      this.animate();
    });
    this.now = Date.now();
    this.sprite.elapsed = this.now - this.then;
    if (
      this.animation.checkForInterval(this.sprite.elapsed, this.frameInterval)
    ) {
      this.then = this.now - (this.sprite.elapsed % this.frameInterval);
      this.updateSprite();
    }
  }

  private updateSprite(): void {
    if (
      this.animation.isAnimationElapsed(
        this.totalFrames,
        this.sprite.currentFrame
      )
    ) {
      this.sprite = this.animation.updateSpriteOnStopped(this.sprite);
      this.animationFinish.emit(true);
    } else {
      this.sprite = this.animation.updateSpriteCurrentFrame(this.sprite);
    }

    this.sprite = this.animation.updateSpriteFrameOnPosition(
      this.sprite,
      this.imgSize,
      this.spriteWidth,
      this.spriteHeight
    );
    this.animationRef.nativeElement.style['background-position-x'] =
      this.sprite.positionX + 'px';
    this.animationRef.nativeElement.style['background-position-y'] =
      this.sprite.positionY + 'px';
  }

  public getCssStyle(): string {
    const defaultStyle = 'ani_style';
    return defaultStyle;
  }
}
