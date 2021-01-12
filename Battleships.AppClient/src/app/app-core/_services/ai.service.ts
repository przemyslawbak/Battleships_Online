import { GameService } from './game.service';
import { Injectable } from '@angular/core';
import { BoardCell } from '@models/board-cell.model';
import { Coordinates } from '@models/coordinates.model';
import { BoardService } from '@services/board.service';
import { FleetService } from './fleet.service';

@Injectable()
export class AiService {
  private mastCounter: number = 0;
  private opponentsFleet: number[] = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
  public hit: boolean = false;
  constructor(
    private board: BoardService,
    private game: GameService,
    private fleet: FleetService
  ) {}

  public getFireCoordinates(board: BoardCell[][]): Coordinates {
    let randomCoordinates: Coordinates = {
      row: -1,
      col: -1,
    } as Coordinates;

    let forbiddenCells: BoardCell[] = this.board.getAllForbiddenCells(board);

    let possibleTargets: BoardCell[] = this.board.getPotentialTargets(
      forbiddenCells,
      board
    );

    this.opponentsFleet = this.fleet.updateOpponentsFleet(
      this.hit,
      possibleTargets.length,
      this.mastCounter,
      this.opponentsFleet
    );

    this.mastCounter = this.fleet.updateMastCounter(
      this.hit,
      possibleTargets.length,
      this.mastCounter
    );

    let haveMoreMasts: boolean = this.fleet.isPossibleMoreMasts(
      this.mastCounter,
      this.opponentsFleet
    );

    if (!haveMoreMasts) {
      this.fleet.removeShipFromArray(this.mastCounter, this.opponentsFleet);
      this.mastCounter = 0;
    }

    this.board.updateCellsToBeAvoided(haveMoreMasts, possibleTargets);

    if (
      this.game.isShootingShipAndProperDifficulty(
        possibleTargets,
        haveMoreMasts,
        this.mastCounter
      )
    ) {
      randomCoordinates = this.board.getRandomBoardCoordinates(
        forbiddenCells,
        possibleTargets
      );
    } else {
      let boardTargets: BoardCell[] = this.board.getBoardTargetArray();
      randomCoordinates = this.board.getRandomBoardCoordinates(
        forbiddenCells,
        boardTargets
      );
    }

    return randomCoordinates;
  }
}
