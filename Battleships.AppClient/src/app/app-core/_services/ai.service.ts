import { GameService } from './game.service';
import { Injectable } from '@angular/core';
import { BoardCell } from '@models/board-cell.model';
import { Coordinates } from '@models/coordinates.model';
import { BoardService } from '@services/board.service';

@Injectable()
export class AiService {
  private mastCounter: number = 0;
  private opponentsFleet: number[] = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
  public hit: boolean = false;
  private avoid: BoardCell[] = [];
  constructor(private board: BoardService, private game: GameService) {}

  public getFireCoordinates(board: BoardCell[][]): Coordinates {
    let shotsCommenced: BoardCell[] = this.board.getCurrentHits(board);
    let shotsMissed: BoardCell[] = this.board.getCurrentMissed(board);
    let cornerCells: BoardCell[] = this.board.getCornerCells(shotsCommenced);
    let randomCoordinates: Coordinates = {
      row: -1,
      col: -1,
    } as Coordinates;

    let forbiddenCells: BoardCell[] = this.board.getAllForbiddenCells(
      cornerCells,
      shotsMissed,
      shotsCommenced,
      this.avoid
    );

    let possibleTargets: BoardCell[] = this.board.getPotentialTargets(
      forbiddenCells,
      shotsCommenced
    );

    this.opponentsFleet = this.updateOpponentsFleet(
      this.hit,
      possibleTargets.length,
      this.mastCounter,
      this.opponentsFleet
    );

    this.mastCounter = this.updateMastCounter(
      this.hit,
      possibleTargets.length,
      this.mastCounter
    );

    let haveMoreMasts: boolean = this.isPossibleMoreMasts(
      this.mastCounter,
      this.opponentsFleet
    );

    if (!haveMoreMasts) {
      this.removeShipFromArray(this.mastCounter, this.opponentsFleet);
      this.mastCounter = 0;
    }

    if (
      this.isHighDifficultyAndNoMoreMastsButHaveTargets(
        haveMoreMasts,
        possibleTargets
      )
    ) {
      this.avoid = this.addPossibleTargetsToAvoidList(
        this.avoid,
        possibleTargets
      );
    }

    if (
      this.isShootingShipAndProperDifficulty(
        possibleTargets,
        haveMoreMasts,
        this.mastCounter
      )
    ) {
      randomCoordinates = this.getRandomBoardCoordinates(
        forbiddenCells,
        possibleTargets
      );
    } else {
      let boardTargets: BoardCell[] = this.getBoardTargetArray();
      randomCoordinates = this.getRandomBoardCoordinates(
        forbiddenCells,
        boardTargets
      );
    }

    return randomCoordinates;
  }

  //todo: fleet service
  private updateOpponentsFleet(
    hit: boolean,
    possibleTargetsCount: number,
    mastCounter: number,
    opponentsFleet: number[]
  ): number[] {
    if (!hit && possibleTargetsCount == 0 && mastCounter > 0) {
      return this.removeShipFromArray(mastCounter, opponentsFleet);
    }

    return opponentsFleet;
  }

  //todo: fleet service
  private updateMastCounter(
    hit: boolean,
    possibleTargetsCount: number,
    mastCounter: number
  ): number {
    if (hit) {
      return mastCounter + 1;
    } else if (!hit && possibleTargetsCount == 0 && mastCounter > 0) {
      return 0;
    }

    return mastCounter;
  }

  //todo: board list
  private addPossibleTargetsToAvoidList(
    avoid: BoardCell[],
    possibleTargets: BoardCell[]
  ): BoardCell[] {
    return avoid.push.apply(avoid, possibleTargets);
  }

  //todo: game service
  private isHighDifficultyAndNoMoreMastsButHaveTargets(
    haveMoreMasts: boolean,
    possibleTargets: BoardCell[]
  ) {
    if (
      !haveMoreMasts &&
      possibleTargets.length > 0 &&
      this.game.getGame().gameDifficulty == 'hard'
    ) {
      return true;
    }

    return false;
  }

  //todo: game service
  private isShootingShipAndProperDifficulty(
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

  //todo: game service
  private isMediumOrHighDifficulty() {
    if (
      this.game.getGame().gameDifficulty == 'medium' ||
      this.game.getGame().gameDifficulty == 'hard'
    ) {
      return true;
    }

    return false;
  }

  //todo: board service
  private getBoardTargetArray(): BoardCell[] {
    let list: BoardCell[] = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        let cell: BoardCell = { col: i, row: j, value: 0 } as BoardCell;
        list.push(cell);
      }
    }

    return list;
  }

  //todo: board service
  private getRandomBoardCoordinates(
    forbiddenCells: BoardCell[],
    possibleTargets: BoardCell[]
  ): Coordinates {
    let isRandomCoordinateForbidden: boolean = true;
    let randomCoordinates: Coordinates;
    while (isRandomCoordinateForbidden) {
      randomCoordinates =
        possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
      if (!this.checkIfRandomIsForbidden(forbiddenCells, randomCoordinates)) {
        isRandomCoordinateForbidden = false;
      }
    }

    return randomCoordinates;
  }

  //todo: fleet service
  private removeShipFromArray(
    mastCounter: number,
    opponentsFleet: number[]
  ): number[] {
    const index = opponentsFleet.indexOf(mastCounter);
    if (index > -1) {
      opponentsFleet.splice(index, 1);
    }

    return opponentsFleet;
  }

  //todo: fleet service
  private isPossibleMoreMasts(
    mastCounter: number,
    opponentsFleet: number[]
  ): boolean {
    let result: boolean = false;
    if (mastCounter > 0) {
      for (let i = 1; i < 4; i++) {
        if (opponentsFleet.indexOf(mastCounter + i) > -1) {
          result = true;
        }
      }
    }

    return result;
  }

  //todo: board service
  private checkIfRandomIsForbidden(
    cells: BoardCell[],
    coord: Coordinates
  ): boolean {
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].row == coord.row && cells[i].col == coord.col) {
        return true;
      }
    }

    return false;
  }
}
