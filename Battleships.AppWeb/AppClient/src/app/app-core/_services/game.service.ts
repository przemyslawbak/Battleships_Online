import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GameState } from '@models/game-state.model';

@Injectable()
export class GameService {
  gameKey = 'game';

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  public setGame(game: GameState | null): boolean {
    if (isPlatformBrowser(this.platformId)) {
      if (game) {
        localStorage.setItem(this.gameKey, JSON.stringify(game));
        return true;
      }
    }
    return false;
  }

  public getGame(): GameState | null {
    if (isPlatformBrowser(this.platformId)) {
      const i = localStorage.getItem(this.gameKey);
      if (i) {
        return JSON.parse(i);
      }
    }
    return null;
  }
}
