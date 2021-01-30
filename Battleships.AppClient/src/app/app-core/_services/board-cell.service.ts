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
      shipArr.some((y) => x.col == y.col && x.row == y.row)
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

  public addCellsToAvoidList(
    avoid: BoardCell[],
    possibleTargets: BoardCell[]
  ): BoardCell[] {
    avoid.push.apply(avoid, possibleTargets);
    return avoid;
  }

  public validateCellBoundary(cellModel: BoardCell): boolean {
    if (
      cellModel.col >= 0 &&
      cellModel.col <= 9 &&
      cellModel.row >= 0 &&
      cellModel.row <= 9 &&
      cellModel.value >= 0 &&
      cellModel.value <= 3
    ) {
      return true;
    }

    return false;
  }

  public getCell(
    rotation: number,
    cellNumber: number,
    coord: Coordinates
  ): BoardCell {
    let cell: BoardCell = this.getCellWithRotation(rotation, cellNumber, coord);

    return this.validateCellBoundary(cell)
      ? cell
      : ({ row: -1, col: -1, value: -1 } as BoardCell);
  }

  public isCellShotBefore(coord: Coordinates, board: BoardCell[][]): boolean {
    return (
      board[coord.col][coord.row].value == 2 ||
      board[coord.col][coord.row].value == 3
    );
  }

  public getForbiddenCells(dropPlace: BoardCell[]): BoardCell[] {
    let list: BoardCell[] = [];
    list.push.apply(list, this.getCornerCells(dropPlace));
    list.push.apply(list, this.getSideCells(dropPlace));
    list.push.apply(list, this.getShipCells(dropPlace));

    return list;
  }

  public updateHoveredBoardCells(
    board: BoardCell[][],
    dropCells: BoardCell[]
  ): BoardCell[][] {
    for (let i = 0; i < dropCells.length; i++) {
      let cell: BoardCell = board[dropCells[i].col][dropCells[i].row];
      board[dropCells[i].col][dropCells[i].row] = this.getHoverCell(cell);
    }

    return board;
  }

  public updateDroppedBoardCells(
    board: BoardCell[][],
    dropCells: BoardCell[]
  ): BoardCell[][] {
    for (let i = 0; i < dropCells.length; i++) {
      let cell: BoardCell = board[dropCells[i].col][dropCells[i].row];
      board[dropCells[i].col][dropCells[i].row] = this.getDroppedCell(cell);
    }

    return board;
  }

  public clearDropedCellsValues(
    board: BoardCell[][],
    dropCells: BoardCell[]
  ): BoardCell[][] {
    for (let i = 0; i < dropCells.length; i++) {
      if (board[dropCells[i].col][dropCells[i].row].value == 1) {
        board[dropCells[i].col][dropCells[i].row].color = 'green';
      } else {
        board[dropCells[i].col][dropCells[i].row].color =
          'rgba(0, 162, 255, 0.2)';
      }
    }

    return board;
  }

  public resetElementsBackground(
    element: HTMLElement,
    cell: BoardCell
  ): HTMLElement {
    if (cell.value == 1) {
      element.style.backgroundColor = 'green';
    } else {
      element.style.backgroundColor = 'rgba(0, 162, 255, 0.2)';
    }

    return element;
  }

  private getCellWithRotation(
    rotation: number,
    cellNumber: number,
    coord: Coordinates
  ): BoardCell {
    return rotation == 0
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
  }

  private getDroppedCell(cell: BoardCell): BoardCell {
    cell.value = 1;
    cell.color = 'green';

    return cell;
  }

  private getHoverCell(cell: BoardCell): BoardCell {
    cell.color = 'rgb(0, 162, 255)';

    return cell;
  }
}
