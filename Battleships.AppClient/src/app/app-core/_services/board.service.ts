import { Coordinates } from '@models/coordinates.model';
import { BoardCell } from '@models/board-cell.model';
import { ShipComponent } from '../../app-game/game-ship/ship.component';
import { Injectable } from '@angular/core';
import { Player } from '@models/player.model';
import { GameService } from './game.service';
import { PlayerService } from './player.service';
import { RandomizerService } from './randomizer.service';
import { BoardCellService } from './board-cell.service';

@Injectable()
export class BoardService {
  public avoidCells: BoardCell[] = [];
  public isDropAllowed: boolean;

  constructor(
    private game: GameService,
    private player: PlayerService,
    private randomizer: RandomizerService,
    private cells: BoardCellService
  ) {}

  public isThereAWinner(players: Player[]): number {
    let result: number = -1;
    for (let i = 0; i < players.length; i++) {
      let hits = this.cells.filterHitCells(players[i].board);
      if (this.player.CheckForWinner(hits)) {
        result = i;
      }
    }

    return result;
  }

  public getEmptyBoard(): BoardCell[][] {
    let board: BoardCell[][] = [];
    for (let i = 0; i < 10; i++) {
      board[i] = [];
      for (let j = 0; j < 10; j++) {
        board[i][j] = this.cells.getEmptyCell(i, j);
      }
    }

    return board;
  }

  public getAllForbiddenCells(board: BoardCell[][]): BoardCell[] {
    let forbidden: BoardCell[] = [];
    forbidden.push.apply(
      forbidden,
      this.cells.getCornerCells(this.cells.filterHitCells(board))
    );
    forbidden.push.apply(forbidden, this.cells.filterMissedCells(board));
    forbidden.push.apply(forbidden, this.cells.filterHitCells(board));
    forbidden.push.apply(forbidden, this.avoidCells);

    return forbidden;
  }

  public isCellAlreadyShot(coord: Coordinates, board: BoardCell[][]): boolean {
    return this.cells.isCellShotBefore(coord, board) ? true : false;
  }

  public updateCellsToBeAvoided(
    haveShipsWithMoreMasts: boolean,
    possibleTargets: BoardCell[]
  ): void {
    if (
      this.game.isHighDifficultyAndNoMoreMastsButHaveTargets(
        haveShipsWithMoreMasts,
        possibleTargets
      )
    ) {
      this.avoidCells = this.cells.addCellsToAvoidList(
        this.avoidCells,
        possibleTargets
      );
    }
  }

  public getShootingCoordinates(
    possibleTargets: BoardCell[],
    haveShipsWithMoreMasts: boolean,
    mastCounter: number,
    forbiddenCells: BoardCell[]
  ): Coordinates {
    return this.game.isShootingShipAndNotLowDifficulty(
      possibleTargets,
      haveShipsWithMoreMasts,
      mastCounter
    )
      ? this.randomizer.getRandomBoardCoordinates(
          forbiddenCells,
          possibleTargets
        )
      : this.randomizer.getRandomBoardCoordinates(
          forbiddenCells,
          this.getBoardTargetArray()
        );
  }

  public getPotentialTargets(
    forbidden: BoardCell[],
    board: BoardCell[][]
  ): BoardCell[] {
    let currentHits: BoardCell[] = this.cells.filterHitCells(board);
    let sideLineCells: BoardCell[] = this.cells.getSideCells(currentHits);
    let wrongCells: BoardCell[] = this.cells.filterTargetCells(
      forbidden,
      sideLineCells
    );

    return this.cells.filterWrongCells(sideLineCells, wrongCells);
  }

  public hideOpponentsShips(board: BoardCell[][]): BoardCell[][] {
    let shipArr = this.cells.filterShipCells(board);
    let hitArr = this.cells.filterHitCells(board);
    for (let i = 0; i < shipArr.length; i++) {
      shipArr[i].color = 'rgba(0, 162, 255, 0.2)';
    }
    for (let i = 0; i < hitArr.length; i++) {
      hitArr[i].color = 'red';
    }

    return board;
  }

  public showOwnShips(board: BoardCell[][]): BoardCell[][] {
    let shipArr = this.cells.filterShipCells(board);
    let hitArr = this.cells.filterHitCells(board);
    for (let i = 0; i < shipArr.length; i++) {
      shipArr[i].color = 'green';
    }
    for (let i = 0; i < hitArr.length; i++) {
      hitArr[i].color = 'red';
    }

    return board;
  }

  public resetEmptyCellsColors(board: BoardCell[][]): BoardCell[][] {
    let seaArr = this.cells.filterEmptySeaCells(board);
    for (let i = 0; i < seaArr.length; i++) {
      seaArr[i].color = 'rgba(0, 162, 255, 0.2)';
    }

    return board;
  }

  private compareBoardWithForbiddenCells(
    dropPlace: BoardCell[],
    board: BoardCell[][]
  ): boolean {
    let forbiddenCells: BoardCell[] = this.cells.getForbiddenCells(dropPlace);
    let shipArr = this.cells.filterShipCells(board);

    return this.cells.filterForbiddenCells(forbiddenCells, shipArr).length < 1;
  }

  private getBoardTargetArray(): BoardCell[] {
    return this.cells.filterEmptyBoard(this.getEmptyBoard());
  }

  public verifyHoveredElement(
    board: BoardCell[][],
    dropCells: BoardCell[],
    nextShip: ShipComponent
  ): boolean {
    let comparison: boolean = this.compareBoardWithForbiddenCells(
      dropCells,
      board
    );

    return this.cells.isDropCellPlaceAllowed(dropCells, nextShip, comparison);
  }

  public updateHoveredElements(
    dropCells: BoardCell[],
    board: BoardCell[][],
    isDropAllowed: boolean,
    htmlElement: HTMLElement
  ) {
    if (isDropAllowed) {
      board = this.cells.updateHoveredBoardCells(board, dropCells);
    } else {
      htmlElement.style.backgroundColor = 'red';
    }
  }

  private getCellsArray(
    board: BoardCell[][],
    coord: Coordinates,
    nextShip: ShipComponent
  ): BoardCell[] {
    let result: BoardCell[] = [];
    for (let i = 0; i < nextShip.size; i++) {
      let cellModel: BoardCell = this.cells.getCell(
        nextShip.rotation,
        i,
        coord,
        board
      );
      let isCellValid: boolean = this.cells.validateCell(cellModel);
      if (isCellValid) {
        result.push(cellModel);
      }
    }

    return result;
  }

  public deployShipOnBoard(
    board: BoardCell[][],
    coord: Coordinates,
    nextShip: ShipComponent
  ): BoardCell[][] {
    let dropCells: Array<BoardCell> = this.getShipsDropCells(
      board,
      coord,
      nextShip
    );

    return this.cells.updateDroppedBoardCells(board, dropCells);
  }

  public getShipsDropCells(
    board: BoardCell[][],
    coord: Coordinates,
    nextShip: ShipComponent
  ): BoardCell[] {
    return nextShip ? this.getCellsArray(board, coord, nextShip) : [];
  }

  public resetBoardElement(
    board: BoardCell[][],
    element: HTMLElement,
    coord: Coordinates,
    dropCells: BoardCell[]
  ): BoardCell[][] {
    element = this.cells.resetElementsBackground(
      element,
      board[coord.col][coord.row]
    );
    board = this.cells.clearDropcellsValues(board, dropCells);

    return board;
  }

  public getAutoDeployCoordinates(
    board: BoardCell[][],
    ship: ShipComponent
  ): Coordinates {
    let isDropAllowed: boolean = false;
    let emptyCellArray: BoardCell[] = this.cells.filterEmptySeaCells(board);
    let coord: Coordinates = {
      row: 0,
      col: 0,
    } as Coordinates;

    while (!isDropAllowed) {
      let dropCells = this.getShipsDropCells(board, coord, ship);
      let randomIndex: number = this.randomizer.getRandomIndex(emptyCellArray);
      let randomEmptyCell: BoardCell = emptyCellArray[randomIndex];
      let dummyHtmlElement: HTMLElement = document.createElement('DIV');
      coord.row = randomEmptyCell.row;
      coord.col = randomEmptyCell.col;
      isDropAllowed = this.verifyHoveredElement(board, dropCells, ship);
      this.updateHoveredElements(
        dropCells,
        board,
        isDropAllowed,
        dummyHtmlElement
      );
      emptyCellArray.splice(randomIndex, 1);
    }

    return coord;
  }
}
