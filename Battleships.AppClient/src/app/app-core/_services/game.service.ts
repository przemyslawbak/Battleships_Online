import { Injectable } from '@angular/core';
import { BoardCell } from '@models/board-cell.model';
import { GameState } from '@models/game-state.model';
import { Subject } from 'rxjs';

@Injectable()
export class GameService {
  public gameState: GameState;
  public gameStateChange: Subject<GameState> = new Subject<GameState>();

  constructor() {}

  public setGame(game: GameState | null): void {
    if (game) {
      this.gameState = game;
      this.gameStateChange.next(this.gameState);
    }
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

  public isHighDifficultyAndNoMoreMastsButHaveTargets(
    haveMoreMasts: boolean,
    possibleTargets: BoardCell[]
  ) {
    if (
      !haveMoreMasts &&
      possibleTargets.length > 0 &&
      this.getGame().gameDifficulty == 'hard'
    ) {
      return true;
    }

    return false;
  }

  public isShootingShipAndProperDifficulty(
    possibleTargets: BoardCell[],
    haveMoreMasts: boolean,
    mastCounter: number
  ): boolean {
    if (
      possibleTargets.length > 0 &&
      mastCounter > 0 &&
      haveMoreMasts &&
      this.isMediumOrHighDifficulty()
    ) {
      return true;
    }
    return false;
  }

  private isMediumOrHighDifficulty() {
    if (
      this.getGame().gameDifficulty == 'medium' ||
      this.getGame().gameDifficulty == 'hard'
    ) {
      return true;
    }

    return false;
  }
}
