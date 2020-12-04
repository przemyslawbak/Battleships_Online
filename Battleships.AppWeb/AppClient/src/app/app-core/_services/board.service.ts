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

  public deployShip(row: number, col: number, nextShip: ShipComponent): void {
    let dropCells: Array<BoardCell> = this.getDropCells(row, col, nextShip);
    for (let i = 0; i < dropCells.length; i++) {
      this.playersBoard[dropCells[i].col][dropCells[i].row].value = 1;
      this.playersBoard[dropCells[i].col][dropCells[i].row].color = 'green';
    }
    this.boardChange.next(this.playersBoard);
  }

  public createEmptyBoard(): void {
    this.playersBoard = this.getEmptyBoard();

    this.boardChange.next(this.playersBoard);
  }

  public resetEmptyCellsColors(): void {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (this.playersBoard[i][j].value == 0) {
          this.playersBoard[i][j].color = 'rgba(0, 162, 255, 0.2)';
        }
      }
    }

    this.boardChange.next(this.playersBoard);
  }

  public autoDeployShip(ship: ShipComponent): BoardCell[][] {
    this.isDropAllowed = false;
    let randomRotate: boolean = Math.random() < 0.5;
    let emptyCellArray: BoardCell[] = [];
    let randomEmptyCell: BoardCell = null;

    if (randomRotate) {
      ship.rotation = 90;
    } else {
      ship.rotation = 0;
    }

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (this.playersBoard[i][j].value == 0) {
          emptyCellArray.push(this.playersBoard[i][j]);
        }
      }
    }

    while (!this.isDropAllowed) {
      let randomIndex: number = Math.floor(
        Math.random() * Math.floor(emptyCellArray.length)
      );
      randomEmptyCell = emptyCellArray[randomIndex];

      var dummyHtmlElement = document.createElement('DIV');

      this.checkHoveredElement(
        'cell',
        randomEmptyCell.row,
        randomEmptyCell.col,
        dummyHtmlElement,
        ship
      );

      emptyCellArray.splice(randomIndex, 1);
    }

    console.log('finished while');
    this.deployShip(randomEmptyCell.row, randomEmptyCell.col, ship);

    let updatedBoard = this.playersBoard;
    return updatedBoard;
  }

  public checkHoveredElement(
    elementType: string,
    row: number,
    col: number,
    element: HTMLElement,
    nextShip: ShipComponent
  ): void {
    let dropPlace = {} as DropModel;
    dropPlace.type = elementType;
    dropPlace.row = row;
    dropPlace.col = col;

    let dropCells: Array<BoardCell> = this.getDropCells(row, col, nextShip);
    this.lastDropCells = dropCells;

    if (elementType == 'cell') {
      let allow: boolean = this.validateDropPlace(dropCells, nextShip);

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
    nextShip: ShipComponent
  ): Array<BoardCell> {
    let result: Array<BoardCell> = [];
    if (nextShip) {
      for (let i = 0; i < nextShip.size; i++) {
        let cellModel: BoardCell = this.getCell(
          nextShip.rotation,
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

    if (!this.isShipNotTouchingOther(dropPlace, this.playersBoard)) {
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
