import { Injectable } from '@angular/core';
import { BoardCell } from '@models/board-cell.model';
import { GameState } from '@models/game-state.model';
import { Subject } from 'rxjs';

@Injectable()
export class GameService {
  private gameState: GameState;
  public gameStateChange: Subject<GameState> = new Subject<GameState>();

  constructor() {}

  public setGame(game: GameState | null): void {
    this.gameState = game;
    if (game) {
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
    haveShipsWithMoreMasts: boolean,
    possibleTargets: BoardCell[]
  ): boolean {
    if (
      !haveShipsWithMoreMasts &&
      possibleTargets.length > 0 &&
      this.gameState.gameDifficulty == 'hard'
    ) {
      return true;
    }

    return false;
  }

  public isShootingShipAndNotLowDifficulty(
    possibleTargets: BoardCell[],
    haveShipsWithMoreMasts: boolean,
    mastCounter: number
  ): boolean {
    return possibleTargets.length > 0 &&
      mastCounter > 0 &&
      haveShipsWithMoreMasts &&
      !this.isLowDifficulty()
      ? true
      : false;
  }

  private isLowDifficulty() {
    return this.gameState.gameDifficulty == 'easy' ? true : false;
  }
}
