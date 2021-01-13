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
  constructor(private board: BoardService, private fleet: FleetService) {}

  public getFireCoordinates(board: BoardCell[][]): Coordinates {
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

    this.opponentsFleet = this.fleet.removeShipFromArray(
      this.mastCounter,
      this.opponentsFleet,
      haveMoreMasts
    );

    this.mastCounter = this.fleet.checkCounter(haveMoreMasts, this.mastCounter);

    this.board.updateCellsToBeAvoided(haveMoreMasts, possibleTargets);

    return this.board.getShootingCoordinates(
      possibleTargets,
      haveMoreMasts,
      this.mastCounter,
      forbiddenCells
    );
  }
}
