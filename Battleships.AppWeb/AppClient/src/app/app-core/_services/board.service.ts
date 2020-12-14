import { BoardCell } from '@models/board-cell.model';
import { ShipComponent } from '../../app-game/game-ship/ship.component';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
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

  CheckForWinner(board: BoardCell[][]): boolean {
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
    row: number,
    col: number,
    nextShip: ShipComponent
  ): BoardCell[][] {
    let dropCells: Array<BoardCell> = this.getDropCells(
      board,
      row,
      col,
      nextShip
    );
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

      this.checkHoveredElement(
        board,
        'cell',
        randomEmptyCell.row,
        randomEmptyCell.col,
        dummyHtmlElement,
        ship
      );

      emptyCellArray.splice(randomIndex, 1);
    }

    board = this.deployShip(
      board,
      randomEmptyCell.row,
      randomEmptyCell.col,
      ship
    );

    let updatedBoard = board;
    return updatedBoard;
  }

  public checkHoveredElement(
    board: BoardCell[][],
    elementType: string,
    row: number,
    col: number,
    element: HTMLElement,
    nextShip: ShipComponent
  ): BoardCell[][] {
    let dropPlace = {} as DropModel;
    dropPlace.type = elementType;
    dropPlace.row = row;
    dropPlace.col = col;

    let dropCells: Array<BoardCell> = this.getDropCells(
      board,
      row,
      col,
      nextShip
    );
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
    row: number,
    col: number
  ): BoardCell[][] {
    if (board[col][row].value == 1) {
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
    board: BoardCell[][],
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
