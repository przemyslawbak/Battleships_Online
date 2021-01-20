import { Injectable } from '@angular/core';
import { BoardCell } from '@models/board-cell.model';
import { Coordinates } from '@models/coordinates.model';
import { BoardService } from '@services/board.service';
import { ShipComponent } from 'app/app-game/game-ship/ship.component';
import { FleetService } from './fleet.service';
import { RandomizerService } from './randomizer.service';

@Injectable()
export class AiService {
  private mastCounter: number = 0;
  private opponentsFleet: number[] = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
  public hit: boolean = false;
  constructor(
    private board: BoardService,
    private fleet: FleetService,
    private randomizer: RandomizerService
  ) {}

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

    let haveShipsWithMoreMasts: boolean = this.fleet.isPossibleMoreMasts(
      this.mastCounter,
      this.opponentsFleet
    );

    this.opponentsFleet = this.fleet.removeShipFromArray(
      this.mastCounter,
      this.opponentsFleet,
      haveShipsWithMoreMasts
    );

    this.mastCounter = this.fleet.checkCounter(
      haveShipsWithMoreMasts,
      this.mastCounter
    );

    this.board.updateCellsToBeAvoided(haveShipsWithMoreMasts, possibleTargets);

    return this.board.getShootingCoordinates(
      possibleTargets,
      haveShipsWithMoreMasts,
      this.mastCounter,
      forbiddenCells
    );
  }

  public autoDeployShip(
    board: BoardCell[][],
    ship: ShipComponent
  ): BoardCell[][] {
    this.board.isDropAllowed = false;

    let randomHalf = this.randomizer.randomHalf();
    ship.rotation = this.fleet.randomRotateShip(randomHalf);
    let coord: Coordinates = this.board.getAutoDeployCoordinates(board, ship);

    board = this.board.deployShipOnBoard(board, coord, ship);
    return board;
  }
}
