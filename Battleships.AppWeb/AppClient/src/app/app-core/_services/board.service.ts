import { BoardCell } from '@models/board-cell.model';
import { ShipComponent } from '../../app-game/game-ship/ship.component';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DropModel } from '@models/drop-model';

@Injectable()
export class BoardService {
  public hoverPlace: DropModel = {} as DropModel;
  public isDropAllowed: boolean;
  public playersBoard: BoardCell[][];
  public lastDropCells: Array<BoardCell> = [];
  public boardChange: Subject<BoardCell[][]> = new Subject<BoardCell[][]>();

  public deployShip(row: number, col: number, dropCells: BoardCell[]): void {
    for (let i = 0; i < dropCells.length; i++) {
      this.playersBoard[dropCells[i].col][dropCells[i].row].value = 1;
      this.playersBoard[dropCells[i].col][dropCells[i].row].color = 'green';
    }
    console.log('ttt');
    this.boardChange.next(this.playersBoard);
  }

  public createEmptyBoard(): void {
    this.playersBoard = this.getEmptyBoard();

    this.boardChange.next(this.playersBoard);
  }

  public autoDeployShip(ship: ShipComponent): BoardCell[][] {
    //todo: deploy ship
    let updatedBoard = this.playersBoard;
    return updatedBoard;
  }

  public checkHoveredElement(
    position: any,
    elementType: string,
    row: number,
    col: number,
    element: HTMLElement,
    fleetWaiting: Array<ShipComponent>
  ): void {
    let dropPlace = {} as DropModel;
    dropPlace.cellX = position.x;
    dropPlace.cellY = position.y;
    dropPlace.type = elementType;
    dropPlace.row = row;
    dropPlace.col = col;

    let dropCells: Array<BoardCell> = this.getDropCells(row, col, fleetWaiting);
    this.lastDropCells = dropCells;

    if (elementType == 'cell') {
      let allow: boolean = this.validateDropPlace(
        dropCells,
        fleetWaiting,
        this.playersBoard
      );

      if (allow) {
        this.isDropAllowed = true;
        this.hoverPlace = dropPlace;
        for (let i = 0; i < dropCells.length; i++) {
          this.playersBoard[dropCells[i].col][dropCells[i].row].color =
            'rgb(0, 162, 255)';
        }

        this.boardChange.next(this.playersBoard);
      } else {
        this.isDropAllowed = false;
        element.style.backgroundColor = 'red';
      }
    }
  }

  public resetBoardElement(element: HTMLElement, row: number, col: number) {
    if (this.playersBoard[col][row].value == 1) {
      element.style.backgroundColor = 'green';
    } else {
      element.style.backgroundColor = 'rgba(0, 162, 255, 0.2)';
    }
    for (let i = 0; i < this.lastDropCells.length; i++) {
      if (
        this.playersBoard[this.lastDropCells[i].col][this.lastDropCells[i].row]
          .value == 1
      ) {
        this.playersBoard[this.lastDropCells[i].col][
          this.lastDropCells[i].row
        ].color = 'green';
      } else {
        this.playersBoard[this.lastDropCells[i].col][
          this.lastDropCells[i].row
        ].color = 'rgba(0, 162, 255, 0.2)';
      }
    }
  }

  public getCell(
    rotation: number,
    i: number,
    row: number,
    col: number,
    board: BoardCell[][]
  ): BoardCell {
    let item: BoardCell =
      rotation == 0
        ? ({ row: row, col: col + i, value: 0 } as BoardCell)
        : ({ row: row + i, col: col, value: 0 } as BoardCell);

    let exists: boolean = board.some((b) =>
      b.some((c) => c.row == item.row && c.col == item.col)
    );

    return exists ? item : ({ row: -1, col: -1, value: -1 } as BoardCell);
  }

  public getDropCells(
    row: number,
    col: number,
    fleetWaiting: Array<ShipComponent>
  ): Array<BoardCell> {
    let result: Array<BoardCell> = [];
    if (fleetWaiting.length > 0) {
      for (let i = 0; i < fleetWaiting[0].size; i++) {
        let cellModel: BoardCell = this.getCell(
          fleetWaiting[0].rotation,
          i,
          row,
          col,
          this.playersBoard
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
    dropPlace: Array<BoardCell>,
    fleetWaiting: Array<ShipComponent>,
    playersBoard: BoardCell[][]
  ): boolean {
    let result: boolean = true;

    if (fleetWaiting.length > 0) {
      if (dropPlace.length !== fleetWaiting[0].size) {
        result = false;
      }
    } else {
      result = false;
    }

    if (!this.isShipNotTouchingOther(dropPlace, playersBoard)) {
      result = false;
    }

    return result;
  }

  private isShipNotTouchingOther(
    dropPlace: BoardCell[],
    playersBoard: BoardCell[][]
  ): boolean {
    let result: boolean = true;
    let forbiddenCells: Array<BoardCell> = this.GetForbiddenCells(dropPlace);

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

  private GetForbiddenCells(dropPlace: BoardCell[]): BoardCell[] {
    let list: BoardCell[] = [];

    for (let i = 0; i < dropPlace.length; i++) {
      list.push({
        row: dropPlace[i].row,
        col: dropPlace[i].col,
        value: 0,
      } as BoardCell);
      list.push({
        row: dropPlace[i].row,
        col: dropPlace[i].col + 1,
        value: 0,
      } as BoardCell);
      list.push({
        row: dropPlace[i].row + 1,
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
        col: dropPlace[i].col - 1,
        value: 0,
      } as BoardCell);
      list.push({
        row: dropPlace[i].row - 1,
        col: dropPlace[i].col,
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
}