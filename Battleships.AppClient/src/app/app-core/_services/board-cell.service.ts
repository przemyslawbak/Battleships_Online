import { Injectable } from '@angular/core';
import { BoardCell } from '@models/board-cell.model';
import { Coordinates } from '@models/coordinates.model';

@Injectable()
export class BoardCellService {
  constructor() {}

  public filterTargetCells(
    forbidden: BoardCell[],
    sideLineCells: BoardCell[]
  ): BoardCell[] {
    return sideLineCells.filter((x) =>
      forbidden.some(
        (y) =>
          x.row > 9 ||
          x.row < 0 ||
          x.col > 9 ||
          x.col < 0 ||
          (x.col == y.col && x.row == y.row)
      )
    );
  }

  public filterWrongCells(
    sideLineCells: BoardCell[],
    wrongCells: BoardCell[]
  ): BoardCell[] {
    return sideLineCells.filter(
      (x) => !wrongCells.filter((y) => y.col == x.col && y.row == x.row).length
    );
  }

  public filterShipCells(board: BoardCell[][]): BoardCell[] {
    return board.flat().filter((x) => x.value == 1);
  }

  public filterHitCells(board: BoardCell[][]): BoardCell[] {
    return board.flat().filter((x) => x.value == 2);
  }

  public filterEmptySeaCells(board: BoardCell[][]): BoardCell[] {
    return board.flat().filter((x) => x.value == 0);
  }

  public filterMissedCells(board: BoardCell[][]): BoardCell[] {
    return board.flat().filter((x) => x.value == 3);
  }

  public filterForbiddenCells(
    forbiddenCells: BoardCell[],
    shipArr: BoardCell[]
  ): BoardCell[] {
    return forbiddenCells.filter((x) =>
      shipArr.some((y) => x.col === y.col && x.row === y.row)
    );
  }

  public filterEmptyBoard(board: BoardCell[][]): BoardCell[] {
    return board.flat().filter((x) => x);
  }

  public filterIsCellAllowed(
    forbiddenCells: BoardCell[],
    coord: Coordinates
  ): BoardCell[] {
    return forbiddenCells.filter(
      (e) => e.row == coord.row && e.col == coord.col
    );
  }

  public getEmptyCell(i: number, j: number): BoardCell {
    return {
      row: j,
      col: i,
      value: 0,
      color: 'rgba(0, 162, 255, 0.2)',
      elX: -1,
      elY: -1,
    } as BoardCell;
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

  public getShipCells(dropPlace: BoardCell[]): any {
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

  public isCellShotBefore(coord: Coordinates, board: BoardCell[][]): boolean {
    return (
      board[coord.col][coord.row].value == 2 ||
      board[coord.col][coord.row].value == 3
    );
  }
}
