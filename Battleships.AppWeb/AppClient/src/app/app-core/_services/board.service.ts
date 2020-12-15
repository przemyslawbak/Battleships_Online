import { Coordinates } from '@models/coordinates.model';
import { BoardCell } from '@models/board-cell.model';
import { ShipComponent } from '../../app-game/game-ship/ship.component';
import { Injectable } from '@angular/core';
import { DropModel } from '@models/drop-model';
import { Player } from '@models/player.model';

@Injectable()
export class BoardService {
  public hoverPlace: DropModel = {} as DropModel;
  public isDropAllowed: boolean;
  public lastDropCells: Array<BoardCell> = [];

  public isThereAWinner(players: Player[]): number {
    let result: number = -1;
    if (this.CheckForWinner(players[0].board)) {
      result = 1;
    }
    if (this.CheckForWinner(players[1].board)) {
      result = 0;
    }

    return result;
  }

  public CheckForWinner(board: BoardCell[][]): boolean {
    let hits: number = 0;
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (board[i][j].value == 2) {
          hits++;
        }
      }
    }

    return hits == 20 ? true : false;
  }

  public eraseOpponentsShips(board: BoardCell[][]): BoardCell[][] {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (board[i][j].value == 1) {
          board[i][j].color = 'rgba(0, 162, 255, 0.2)';
        }

        if (board[i][j].value == 2) {
          board[i][j].color = 'red';
        }
      }
    }
    return board;
  }

  public showOwnShips(board: BoardCell[][]): BoardCell[][] {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (board[i][j].value == 1) {
          board[i][j].color = 'green';
        }

        if (board[i][j].value == 2) {
          board[i][j].color = 'red';
        }
      }
    }
    return board;
  }

  public deployShip(
    board: BoardCell[][],
    coord: Coordinates,
    nextShip: ShipComponent
  ): BoardCell[][] {
    let dropCells: Array<BoardCell> = this.getDropCells(board, coord, nextShip);
    for (let i = 0; i < dropCells.length; i++) {
      board[dropCells[i].col][dropCells[i].row].value = 1;
      board[dropCells[i].col][dropCells[i].row].color = 'green';
    }

    return board;
  }

  public resetEmptyCellsColors(board: BoardCell[][]): BoardCell[][] {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (board[i][j].value == 0) {
          board[i][j].color = 'rgba(0, 162, 255, 0.2)';
        }
      }
    }

    return board;
  }

  public autoDeployShip(
    board: BoardCell[][],
    ship: ShipComponent
  ): BoardCell[][] {
    this.isDropAllowed = false;
    let randomRotate: boolean = Math.random() < 0.5;
    let emptyCellArray: BoardCell[] = [];
    let randomEmptyCell: BoardCell = null;

    let coord: Coordinates = {
      row: 0,
      col: 0,
    } as Coordinates;

    if (randomRotate) {
      ship.rotation = 90;
    } else {
      ship.rotation = 0;
    }

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (board[i][j].value == 0) {
          emptyCellArray.push(board[i][j]);
        }
      }
    }

    while (!this.isDropAllowed) {
      let randomIndex: number = Math.floor(
        Math.random() * Math.floor(emptyCellArray.length)
      );
      randomEmptyCell = emptyCellArray[randomIndex];

      var dummyHtmlElement = document.createElement('DIV');

      coord.row = randomEmptyCell.row;
      coord.col = randomEmptyCell.col;

      this.checkHoveredElement(board, 'cell', coord, dummyHtmlElement, ship);

      emptyCellArray.splice(randomIndex, 1);
    }

    board = this.deployShip(board, coord, ship);

    let updatedBoard = board;
    return updatedBoard;
  }

  public checkHoveredElement(
    board: BoardCell[][],
    elementType: string,
    coord: Coordinates,
    element: HTMLElement,
    nextShip: ShipComponent
  ): BoardCell[][] {
    let dropPlace = {} as DropModel;
    dropPlace.type = elementType;
    dropPlace.row = coord.row;
    dropPlace.col = coord.col;

    let dropCells: Array<BoardCell> = this.getDropCells(board, coord, nextShip);
    this.lastDropCells = dropCells;

    if (elementType == 'cell') {
      let allow: boolean = this.validateDropPlace(board, dropCells, nextShip);

      if (allow) {
        this.isDropAllowed = true;
        this.hoverPlace = dropPlace;
        for (let i = 0; i < dropCells.length; i++) {
          board[dropCells[i].col][dropCells[i].row].color = 'rgb(0, 162, 255)';
        }
      } else {
        this.isDropAllowed = false;
        element.style.backgroundColor = 'red';
      }
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
    i: number,
    coord: Coordinates,
    board: BoardCell[][]
  ): BoardCell {
    let item: BoardCell =
      rotation == 0
        ? ({ row: coord.row, col: coord.col + i, value: 0 } as BoardCell)
        : ({ row: coord.row + i, col: coord.col, value: 0 } as BoardCell);

    let exists: boolean = board.some((b) =>
      b.some((c) => c.row == item.row && c.col == item.col)
    );

    return exists ? item : ({ row: -1, col: -1, value: -1 } as BoardCell);
  }

  public getDropCells(
    board: BoardCell[][],
    coord: Coordinates,
    nextShip: ShipComponent
  ): Array<BoardCell> {
    let result: Array<BoardCell> = [];
    if (nextShip) {
      for (let i = 0; i < nextShip.size; i++) {
        let cellModel: BoardCell = this.getCell(
          nextShip.rotation,
          i,
          coord,
          board
        );

        if (cellModel.col >= 0 && cellModel.row >= 0 && cellModel.value >= 0) {
          result.push(cellModel);
        }
      }
    }

    return result;
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
        } as BoardCell;
      }
    }

    return board;
  }

  public validateDropPlace(
    board: BoardCell[][],
    dropPlace: Array<BoardCell>,
    nextShip: ShipComponent
  ): boolean {
    let result: boolean = true;

    if (nextShip) {
      if (dropPlace.length !== nextShip.size) {
        result = false;
      }
    } else {
      result = false;
    }

    if (!this.isShipNotTouchingOther(dropPlace, board)) {
      result = false;
    }

    return result;
  }

  private isShipNotTouchingOther(
    dropPlace: BoardCell[],
    playersBoard: BoardCell[][]
  ): boolean {
    let result: boolean = true;
    let forbiddenCells: Array<BoardCell> = this.getForbiddenCells(dropPlace);

    if (!this.compareBoardWithForbiddenCells(forbiddenCells, playersBoard)) {
      result = false;
    }

    return result;
  }

  private compareBoardWithForbiddenCells(
    forbiddenCells: Array<BoardCell>,
    playersBoard: BoardCell[][]
  ): boolean {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (playersBoard[i][j].value !== 1) continue;
        for (let f = 0; f < forbiddenCells.length; f++) {
          if (
            playersBoard[i][j].col == forbiddenCells[f].col &&
            playersBoard[i][j].row == forbiddenCells[f].row &&
            playersBoard[i][j].value == 1
          ) {
            return false;
          }
        }
      }
    }

    return true;
  }

  public getForbiddenCells(dropPlace: BoardCell[]): BoardCell[] {
    let list: BoardCell[] = [];

    list.push.apply(list, this.getCornerCells(dropPlace));
    list.push.apply(list, this.getSideCells(dropPlace));
    list.push.apply(list, this.getShipCells(dropPlace));

    return list;
  }
  getShipCells(dropPlace: BoardCell[]): any {
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

  public getCurrentHits(board: BoardCell[][]): BoardCell[] {
    let list: BoardCell[] = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (board[i][j].value == 2) {
          list.push(board[i][j]);
        }
      }
    }

    return list;
  }

  public getCurrentMissed(board: BoardCell[][]): BoardCell[] {
    let list: BoardCell[] = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (board[i][j].value == 3) {
          list.push(board[i][j]);
        }
      }
    }

    return list;
  }

  public getPotentialTargets(
    forbidden: BoardCell[],
    hits: BoardCell[]
  ): BoardCell[] {
    let list: BoardCell[] = [];
    let sideLineCells: BoardCell[] = this.getSideCells(hits);

    for (let i = 0; i < sideLineCells.length; i++) {
      let isWrong: boolean = false;
      for (let j = 0; j < forbidden.length; j++) {
        if (
          sideLineCells[i].col == forbidden[j].col &&
          sideLineCells[i].row == forbidden[j].row
        ) {
          isWrong = true;
        }
      }
      if (
        !isWrong &&
        sideLineCells[i].col >= 0 &&
        sideLineCells[i].col <= 9 &&
        sideLineCells[i].row >= 0 &&
        sideLineCells[i].row <= 9
      ) {
        list.push(sideLineCells[i]);
      }
    }

    return list;
  }

  public isCellAlreadyShot(coord: Coordinates, board: BoardCell[][]): boolean {
    return board[coord.col][coord.row].value == 2 ||
      board[coord.col][coord.row].value == 3
      ? true
      : false;
  }
}
