import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GameStart } from '@models/game-start';

@Injectable()
export class GameService {
  gameKey = 'game';

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  public setGame(game: GameStart | null): boolean {
    if (isPlatformBrowser(this.platformId)) {
      if (game) {
        localStorage.setItem(this.gameKey, JSON.stringify(game));
        return true;
      }
    }
    return false;
  }

  public getGame(): GameStart | null {
    if (isPlatformBrowser(this.platformId)) {
      const i = localStorage.getItem(this.gameKey);
      if (i) {
        return JSON.parse(i);
      }
    }
    return null;
  }
}
