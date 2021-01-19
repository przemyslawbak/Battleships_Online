import { Coordinates } from '@models/coordinates.model';
import { BoardCell } from '@models/board-cell.model';
import { ShipComponent } from '../../app-game/game-ship/ship.component';
import { Injectable } from '@angular/core';
import { Player } from '@models/player.model';
import { GameService } from './game.service';

@Injectable()
export class BoardService {
  public avoidCells: BoardCell[] = [];
  public isDropAllowed: boolean;
  public lastDropCells: Array<BoardCell> = [];

  constructor(private game: GameService) {}

  //ok
  public isThereAWinner(players: Player[]): number {
    let result: number = -1;
    for (let i = 0; i < players.length; i++) {
      if (this.CheckForWinner(players[i].board)) {
        result = i;
      }
    }

    return result;
  }

  //ok
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

  //todo: fleet service
  private getShipsDropCells(
    board: BoardCell[][],
    coord: Coordinates,
    nextShip: ShipComponent
  ): Array<BoardCell> {
    return nextShip ? this.pushCells(board, coord, nextShip) : [];
  }

  //ok
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

  //ok
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

  //ok, sevice?
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

  //ok
  private getForbiddenCells(dropPlace: BoardCell[]): BoardCell[] {
    let list: BoardCell[] = [];

    list.push.apply(list, this.getCornerCells(dropPlace));
    list.push.apply(list, this.getSideCells(dropPlace));
    list.push.apply(list, this.getShipCells(dropPlace));

    return list;
  }

  //ok
  public getAllForbiddenCells(board: BoardCell[][]): BoardCell[] {
    let forbidden: BoardCell[] = [];
    forbidden.push.apply(
      forbidden,
      this.getCornerCells(this.getCurrentHits(board))
    );
    forbidden.push.apply(forbidden, this.getCurrentMissed(board));
    forbidden.push.apply(forbidden, this.getCurrentHits(board));
    forbidden.push.apply(forbidden, this.avoidCells);

    return forbidden;
  }

  //ok, fleet service?
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

  //ok
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

  //ok
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

  //ok
  public isCellAlreadyShot(coord: Coordinates, board: BoardCell[][]): boolean {
    return board[coord.col][coord.row].value == 2 ||
      board[coord.col][coord.row].value == 3
      ? true
      : false;
  }

  //ok
  private addPossibleTargetsToAvoidList(
    avoid: BoardCell[],
    possibleTargets: BoardCell[]
  ): BoardCell[] {
    return avoid.push.apply(avoid, possibleTargets);
  }

  //ok
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

  //ok
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

  //ok
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

  //ok
  public getDeployCoordinates(
    board: BoardCell[][],
    ship: ShipComponent
  ): Coordinates {
    let emptyCellArray: BoardCell[] = this.getEmptyCells(board);
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

  //ok
  public getPotentialTargets(
    forbidden: BoardCell[],
    board: BoardCell[][]
  ): BoardCell[] {
    let currentHits: BoardCell[] = this.getCurrentHits(board);
    let sideLineCells: BoardCell[] = this.getSideCells(currentHits);

    let wrongCells: BoardCell[] = sideLineCells.filter((x) =>
      forbidden.some(
        (y) =>
          x.row > 9 ||
          x.row < 0 ||
          x.col > 9 ||
          x.col < 0 ||
          (x.col == y.col && x.row == y.row)
      )
    );

    return sideLineCells.filter(
      (x) => !wrongCells.filter((y) => y.col == x.col && y.row == x.row).length
    );
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

  //ok
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

  //todo: player service
  private CheckForWinner(board: BoardCell[][]): boolean {
    let result = board.flat().filter((x) => x.value == 2);

    return result.length == 20 ? true : false;
  }

  //ok
  public hideOpponentsShips(board: BoardCell[][]): BoardCell[][] {
    let shipArr = board.flat().filter((x) => x.value == 1);
    let hitArr = board.flat().filter((x) => x.value == 2);
    for (let i = 0; i < shipArr.length; i++) {
      shipArr[i].color = 'rgba(0, 162, 255, 0.2)';
    }
    for (let i = 0; i < hitArr.length; i++) {
      hitArr[i].color = 'red';
    }

    return board;
  }

  //ok
  public showOwnShips(board: BoardCell[][]): BoardCell[][] {
    let shipArr = board.flat().filter((x) => x.value == 1);
    let hitArr = board.flat().filter((x) => x.value == 2);
    for (let i = 0; i < shipArr.length; i++) {
      shipArr[i].color = 'green';
    }
    for (let i = 0; i < hitArr.length; i++) {
      hitArr[i].color = 'red';
    }

    return board;
  }

  //ok
  public resetEmptyCellsColors(board: BoardCell[][]): BoardCell[][] {
    let seaArr = board.flat().filter((x) => x.value == 0);
    for (let i = 0; i < seaArr.length; i++) {
      seaArr[i].color = 'rgba(0, 162, 255, 0.2)';
    }

    return board;
  }

  //ok
  private compareBoardWithForbiddenCells(
    dropPlace: BoardCell[],
    playersBoard: BoardCell[][]
  ): boolean {
    let forbiddenCells: BoardCell[] = this.getForbiddenCells(dropPlace);
    let ships = playersBoard.flat().filter((x) => x.value == 1);
    let contains = forbiddenCells.filter((x) =>
      ships.some((y) => x.col === y.col && x.row === y.row)
    );

    return contains.length < 1;
  }

  //ok
  private getCurrentHits(board: BoardCell[][]): BoardCell[] {
    return board.flat().filter((x) => x.value == 2);
  }

  //ok
  public getCurrentMissed(board: BoardCell[][]): BoardCell[] {
    return board.flat().filter((x) => x.value == 3);
  }

  //ok
  private getBoardTargetArray(): BoardCell[] {
    return this.getEmptyBoard()
      .flat()
      .filter((x) => x);
  }

  //ok
  private checkIfRandomIsForbidden(
    forbiddenCells: BoardCell[],
    coord: Coordinates
  ): boolean {
    forbiddenCells.filter((e) => e.row == coord.row && e.col == coord.col)
      .length > 0
      ? true
      : false;

    return false;
  }

  //ok
  private getEmptyCells(board: BoardCell[][]): BoardCell[] {
    return board.flat().filter((x) => x.value == 0);
  }
}
