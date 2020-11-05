import { Injectable } from '@angular/core';
import { GameStart } from '@models/game-start';

@Injectable()
export class GameService {
  gameKey = 'game';

  public setGame(game: GameStart | null): boolean {
    if (game) {
      localStorage.setItem(this.gameKey, JSON.stringify(game));
      return true;
    }
    return false;
  }

  public getGame(): GameStart | null {
    const i = localStorage.getItem(this.gameKey);
    if (i) {
      return JSON.parse(i);
    }
    return null;
  }
}
