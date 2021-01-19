import { Coordinates } from '@models/coordinates.model';
import { BoardCell } from '@models/board-cell.model';
import { ShipComponent } from '../../app-game/game-ship/ship.component';
import { Injectable } from '@angular/core';
import { Player } from '@models/player.model';
import { GameService } from './game.service';
import { BoardFiltersService } from './board-filters.service';

@Injectable()
export class BoardService {
  public avoidCells: BoardCell[] = [];
  public isDropAllowed: boolean;
  public lastDropCells: Array<BoardCell> = [];

  constructor(
    private game: GameService,
    private filters: BoardFiltersService
  ) {}

  public isThereAWinner(players: Player[]): number {
    let result: number = -1;
    for (let i = 0; i < players.length; i++) {
      if (this.CheckForWinner(players[i].board)) {
        result = i;
      }
    }

    return result;
  }

  public deployShip(
    board: BoardCell[][],
    coord: Coordinates,
    nextShip: ShipComponent
  ): BoardCell[][] {
    let dropCells: Array<BoardCell> = this.getShipsDropCells(
      board,
      coord,
      nextShip
    );
    for (let i = 0; i < dropCells.length; i++) {
      board[dropCells[i].col][dropCells[i].row].value = 1;
      board[dropCells[i].col][dropCells[i].row].color = 'green';
    }

    return board;
  }

  public getEmptyBoard(): BoardCell[][] {
    let board: BoardCell[][] = [];
    for (let i = 0; i < 10; i++) {
      board[i] = [];
      for (let j = 0; j < 10; j++) {
        board[i][j] = {
          row: j,
          col: i,
          value: 0,
          color: 'rgba(0, 162, 255, 0.2)',
          elX: -1,
          elY: -1,
        } as BoardCell;
      }
    }
    console.log(board);
    return board;
  }

  public getAllForbiddenCells(board: BoardCell[][]): BoardCell[] {
    let forbidden: BoardCell[] = [];
    forbidden.push.apply(
      forbidden,
      this.getCornerCells(this.filters.filterHitCells(board))
    );
    forbidden.push.apply(forbidden, this.filters.filterMissedCells(board));
    forbidden.push.apply(forbidden, this.filters.filterHitCells(board));
    forbidden.push.apply(forbidden, this.avoidCells);

    return forbidden;
  }

  public getSideCells(dropPlace: BoardCell[]): BoardCell[] {
    let list: BoardCell[] = [];
    for (let i = 0; i < dropPlace.length; i++) {
      list.push({
        row: dropPlace[i].row,
        col: dropPlace[i].col + 1,
        value: 0,
      } as BoardCell);

      list.push({
        row: dropPlace[i].row + 1,
        col: dropPlace[i].col,
        value: 0,
      } as BoardCell);
      list.push({
        row: dropPlace[i].row,
        col: dropPlace[i].col - 1,
        value: 0,
      } as BoardCell);

      list.push({
        row: dropPlace[i].row - 1,
        col: dropPlace[i].col,
        value: 0,
      } as BoardCell);
    }

    return list;
  }

  public getCornerCells(dropPlace: BoardCell[]): BoardCell[] {
    let list: BoardCell[] = [];
    for (let i = 0; i < dropPlace.length; i++) {
      list.push({
        row: dropPlace[i].row + 1,
        col: dropPlace[i].col + 1,
        value: 0,
      } as BoardCell);
      list.push({
        row: dropPlace[i].row - 1,
        col: dropPlace[i].col - 1,
        value: 0,
      } as BoardCell);
      list.push({
        row: dropPlace[i].row - 1,
        col: dropPlace[i].col + 1,
        value: 0,
      } as BoardCell);
      list.push({
        row: dropPlace[i].row + 1,
        col: dropPlace[i].col - 1,
        value: 0,
      } as BoardCell);
    }

    return list;
  }

  public isCellAlreadyShot(coord: Coordinates, board: BoardCell[][]): boolean {
    return board[coord.col][coord.row].value == 2 ||
      board[coord.col][coord.row].value == 3
      ? true
      : false;
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
      this.avoidCells = this.addPossibleTargetsToAvoidList(
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
      ? this.getRandomBoardCoordinates(forbiddenCells, possibleTargets)
      : this.getRandomBoardCoordinates(
          forbiddenCells,
          this.getBoardTargetArray()
        );
  }

  public getDeployCoordinates(
    board: BoardCell[][],
    ship: ShipComponent
  ): Coordinates {
    let emptyCellArray: BoardCell[] = this.filters.filterEmptySeaCells(board);
    let coord: Coordinates = {
      row: 0,
      col: 0,
    } as Coordinates;
    let randomEmptyCell: BoardCell = null;

    while (!this.isDropAllowed) {
      let randomIndex: number = Math.floor(
        Math.random() * Math.floor(emptyCellArray.length)
      );
      randomEmptyCell = emptyCellArray[randomIndex];

      let dummyHtmlElement: HTMLElement = document.createElement('DIV');

      coord.row = randomEmptyCell.row;
      coord.col = randomEmptyCell.col;

      this.checkHoveredElement(board, coord, dummyHtmlElement, ship);

      emptyCellArray.splice(randomIndex, 1);
    }

    return coord;
  }

  public getPotentialTargets(
    forbidden: BoardCell[],
    board: BoardCell[][]
  ): BoardCell[] {
    let currentHits: BoardCell[] = this.filters.filterHitCells(board);
    let sideLineCells: BoardCell[] = this.getSideCells(currentHits);

    let wrongCells: BoardCell[] = this.filters.filterTargetCells(
      forbidden,
      sideLineCells
    );

    return this.filters.filterWrongCells(sideLineCells, wrongCells);
  }

  public checkHoveredElement(
    board: BoardCell[][],
    coord: Coordinates,
    element: HTMLElement,
    nextShip: ShipComponent
  ): BoardCell[][] {
    this.lastDropCells = this.getShipsDropCells(board, coord, nextShip);

    if (this.isDropPlaceAllowed(board, this.lastDropCells, nextShip)) {
      this.isDropAllowed = true;
      for (let i = 0; i < this.lastDropCells.length; i++) {
        board[this.lastDropCells[i].col][this.lastDropCells[i].row].color =
          'rgb(0, 162, 255)';
      }
    } else {
      this.isDropAllowed = false;
      element.style.backgroundColor = 'red';
    }

    return board;
  }

  public resetBoardElement(
    board: BoardCell[][],
    element: HTMLElement,
    coord: Coordinates
  ): BoardCell[][] {
    if (board[coord.col][coord.row].value == 1) {
      element.style.backgroundColor = 'green';
    } else {
      element.style.backgroundColor = 'rgba(0, 162, 255, 0.2)';
    }
    for (let i = 0; i < this.lastDropCells.length; i++) {
      if (
        board[this.lastDropCells[i].col][this.lastDropCells[i].row].value == 1
      ) {
        board[this.lastDropCells[i].col][this.lastDropCells[i].row].color =
          'green';
      } else {
        board[this.lastDropCells[i].col][this.lastDropCells[i].row].color =
          'rgba(0, 162, 255, 0.2)';
      }
    }

    return board;
  }

  public getCell(
    rotation: number,
    cellNumber: number,
    coord: Coordinates,
    board: BoardCell[][]
  ): BoardCell {
    let item: BoardCell =
      rotation == 0
        ? ({
            row: coord.row,
            col: coord.col + cellNumber,
            value: 0,
          } as BoardCell)
        : ({
            row: coord.row + cellNumber,
            col: coord.col,
            value: 0,
          } as BoardCell);

    let exists: boolean = board.some((b) =>
      b.some((c) => c.row == item.row && c.col == item.col)
    );

    return exists ? item : ({ row: -1, col: -1, value: -1 } as BoardCell);
  }

  public hideOpponentsShips(board: BoardCell[][]): BoardCell[][] {
    let shipArr = this.filters.filterShipCells(board);
    let hitArr = this.filters.filterHitCells(board);
    for (let i = 0; i < shipArr.length; i++) {
      shipArr[i].color = 'rgba(0, 162, 255, 0.2)';
    }
    for (let i = 0; i < hitArr.length; i++) {
      hitArr[i].color = 'red';
    }

    return board;
  }

  public showOwnShips(board: BoardCell[][]): BoardCell[][] {
    let shipArr = this.filters.filterShipCells(board);
    let hitArr = this.filters.filterHitCells(board);
    for (let i = 0; i < shipArr.length; i++) {
      shipArr[i].color = 'green';
    }
    for (let i = 0; i < hitArr.length; i++) {
      hitArr[i].color = 'red';
    }

    return board;
  }

  public resetEmptyCellsColors(board: BoardCell[][]): BoardCell[][] {
    let seaArr = this.filters.filterEmptySeaCells(board);
    for (let i = 0; i < seaArr.length; i++) {
      seaArr[i].color = 'rgba(0, 162, 255, 0.2)';
    }

    return board;
  }

  private compareBoardWithForbiddenCells(
    dropPlace: BoardCell[],
    board: BoardCell[][]
  ): boolean {
    let forbiddenCells: BoardCell[] = this.getForbiddenCells(dropPlace);
    let shipArr = this.filters.filterShipCells(board);

    return (
      this.filters.filterForbiddenCells(forbiddenCells, shipArr).length < 1
    );
  }

  private getBoardTargetArray(): BoardCell[] {
    return this.filters.filterEmptyBoard(this.getEmptyBoard());
  }

  private checkIfRandomIsForbidden(
    forbiddenCells: BoardCell[],
    coord: Coordinates
  ): boolean {
    this.filters.filterIsCellAllowed(forbiddenCells, coord).length > 0
      ? true
      : false;

    return false;
  }

  private getShipsDropCells(
    board: BoardCell[][],
    coord: Coordinates,
    nextShip: ShipComponent
  ): Array<BoardCell> {
    return nextShip ? this.pushCells(board, coord, nextShip) : [];
  }

  private pushCells(
    board: BoardCell[][],
    coord: Coordinates,
    nextShip: ShipComponent
  ): BoardCell[] {
    let result: BoardCell[] = [];
    for (let cellNumber = 0; cellNumber < nextShip.size; cellNumber++) {
      let cellModel: BoardCell = this.getCell(
        nextShip.rotation,
        cellNumber,
        coord,
        board
      );

      if (this.validateCell(cellModel)) {
        result.push(cellModel);
      }
    }

    return result;
  }

  private validateCell(cellModel: BoardCell): boolean {
    if (cellModel.col >= 0 && cellModel.row >= 0 && cellModel.value >= 0) {
      return true;
    }

    return false;
  }

  private isDropPlaceAllowed(
    board: BoardCell[][],
    dropPlace: BoardCell[],
    nextShip: ShipComponent
  ): boolean {
    if (!nextShip || !this.compareBoardWithForbiddenCells(dropPlace, board)) {
      return false;
    }

    if (dropPlace.length !== nextShip.size) {
      return false;
    }

    return true;
  }

  private getForbiddenCells(dropPlace: BoardCell[]): BoardCell[] {
    let list: BoardCell[] = [];

    list.push.apply(list, this.getCornerCells(dropPlace));
    list.push.apply(list, this.getSideCells(dropPlace));
    list.push.apply(list, this.getShipCells(dropPlace));

    return list;
  }

  private getShipCells(dropPlace: BoardCell[]): any {
    let list: BoardCell[] = [];
    for (let i = 0; i < dropPlace.length; i++) {
      list.push({
        row: dropPlace[i].row,
        col: dropPlace[i].col,
        value: 0,
      } as BoardCell);
    }

    return list;
  }

  private addPossibleTargetsToAvoidList(
    avoid: BoardCell[],
    possibleTargets: BoardCell[]
  ): BoardCell[] {
    return avoid.push.apply(avoid, possibleTargets);
  }

  private getRandomBoardCoordinates(
    forbiddenCells: BoardCell[],
    possibleTargets: BoardCell[]
  ): Coordinates {
    let isRandomCoordinateForbidden: boolean = true;
    let randomCoordinates: Coordinates;
    while (isRandomCoordinateForbidden) {
      let index = Math.floor(Math.random() * possibleTargets.length);
      randomCoordinates = possibleTargets[index];
      if (!this.checkIfRandomIsForbidden(forbiddenCells, randomCoordinates)) {
        isRandomCoordinateForbidden = false;
      }
    }

    return randomCoordinates;
  }

  //todo: player service
  private CheckForWinner(board: BoardCell[][]): boolean {
    let result = this.filters.filterHitCells(board);

    return result.length == 20 ? true : false;
  }
}
