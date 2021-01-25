import { Injectable } from '@angular/core';
import { BoardCell } from '@models/board-cell.model';
import { Coordinates } from '@models/coordinates.model';
import { Player } from '@models/player.model';
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

  private autoDeployShip(
    board: BoardCell[][],
    ship: ShipComponent
  ): BoardCell[][] {
    let randomHalf = this.randomizer.randomHalf();
    ship.rotation = this.fleet.getRandomRotationValue(randomHalf);
    let coord: Coordinates = this.board.getAutoDeployCoordinates(board, ship);
    board = this.board.deployShipOnBoard(board, coord, ship);
    return board;
  }

  //todo: test below

  public autoDeploy(
    board: BoardCell[][],
    fleet: ShipComponent[],
    computer: boolean,
    isDeploymentAllowed: boolean
  ): BoardCell[][] {
    if (isDeploymentAllowed) {
      while (fleet.length > 0) {
        board = this.autoDeployShip(board, fleet[0]);
        if (computer) {
          fleet.splice(0, 1);
        } else {
          this.fleet.moveFromWaitingToDeployed();
        }
      }
      if (!computer) {
        board = this.board.resetEmptyCellsColors(board);
      }
    }

    return board;
  }

  public setupAiPlayer(
    players: Player[],
    aiPlayerNumber: number,
    isDeploymentAllowed: boolean
  ): Player[] {
    players[aiPlayerNumber].board = this.autoDeploy(
      this.board.getEmptyBoard(),
      this.fleet.createFleet(),
      true,
      isDeploymentAllowed
    );
    players[aiPlayerNumber].isDeployed = true;

    return players;
  }
}
