import { Injectable } from '@angular/core';
import { GameState } from '@models/game-state.model';
import { Subject } from 'rxjs';

@Injectable()
export class GameService {
  public gameState: GameState;
  public gameStateChange: Subject<GameState> = new Subject<GameState>();

  public setGame(game: GameState | null): boolean {
    if (game) {
      this.gameState = game;
      this.gameStateChange.next(this.gameState);
      return true;
    }

    return false;
  }

  public getGame(): GameState | null {
    if (this.gameState) {
      return this.gameState;
    }

    return null;
  }

  public isGameStarted(): boolean {
    if (this.gameState) {
      return true;
    }

    return false;
  }
}
