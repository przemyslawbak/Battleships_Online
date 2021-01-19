import { Coordinates } from '@models/coordinates.model';
import { BoardCell } from '@models/board-cell.model';
import { ShipComponent } from '../../app-game/game-ship/ship.component';
import { Injectable } from '@angular/core';
import { DropModel } from '@models/drop-model';
import { Player } from '@models/player.model';
import { GameService } from './game.service';

@Injectable()
export class BoardService {
  public avoidCells: BoardCell[] = [];
  public hoverPlace: DropModel = {} as DropModel;
  public isDropAllowed: boolean;
  public lastDropCells: Array<BoardCell> = [];

  constructor(private game: GameService) {}

  //ok
  public isThereAWinner(players: Player[]): number {
    let result: number = -1;
    for (let i = 0; i < players.length; i++){
      if (this.CheckForWinner(players[i].board) {
        result = i;
      }
    }

    return result;
  }

  //todo: player service
  private CheckForWinner(board: BoardCell[][]): boolean {
    let result = board.flat().filter(x => x.value == 2);

    return result.length == 20 ? true : false;
  }

  //ok
  public hideOpponentsShips(board: BoardCell[][]): BoardCell[][] {
    let shipArr = board.flat().filter(x => x.value == 1);
    let hitArr = board.flat().filter(x => x.value == 2);
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
    let shipArr = board.flat().filter(x => x.value == 1);
    let hitArr = board.flat().filter(x => x.value == 2);
    for (let i = 0; i < shipArr.length; i++) {
      shipArr[i].color = 'green';
    }
    for (let i = 0; i < hitArr.length; i++) {
      hitArr[i].color = 'red';
    }
    
    return board;
  }

  //ok
  public deployShip(
    board: BoardCell[][],
    coord: Coordinates,
    nextShip: ShipComponent
  ): BoardCell[][] {
    let dropCells: Array<BoardCell> = this.getShipsDropCells(board, coord, nextShip);
    for (let i = 0; i < dropCells.length; i++) {
      board[dropCells[i].col][dropCells[i].row].value = 1;
      board[dropCells[i].col][dropCells[i].row].color = 'green';
    }

    return board;
  }

  //ok
  public resetEmptyCellsColors(board: BoardCell[][]): BoardCell[][] {
    let seaArr = board.flat().filter(x => x.value == 0);
    for (let i = 0; i < seaArr.length; i++) {
      seaArr[i].color = 'rgba(0, 162, 255, 0.2)';
    }

    return board;
  }

  //todo: fleet service
  private getShipsDropCells(
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

  //ok
  public getEmptyBoard(): BoardCell[][] {
    let board: BoardCell[][] = new Array(10);
    for (let i = 0; i < board.length; i++) {
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

    return board;
  }

  //ok, sevice?
  private validateDropPlace(
    board: BoardCell[][],
    dropPlace: BoardCell[],
    nextShip: ShipComponent
  ): boolean {
    if (!nextShip){
      return false;
    }

    if (dropPlace.length !== nextShip.size) {
        return false;
      }

    if (!this.compareBoardWithForbiddenCells(dropPlace, board)) {
      return false;
    }

    return true;
  }

  //ok
  private compareBoardWithForbiddenCells(
    dropPlace: BoardCell[],
    playersBoard: BoardCell[][]
  ): boolean {
    let forbiddenCells: BoardCell[] = this.getForbiddenCells(dropPlace);
    let ships = playersBoard.flat().filter(x => x.value == 1);
    let contains = forbiddenCells.filter(x => ships.some(y => x.col === y.col && x.row === y.row));
    
    return contains.length < 0;
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
  private getCurrentHits(board: BoardCell[][]): BoardCell[] {
    return board.flat().filter(x => x.value == 2);
  }

  //ok
  public getCurrentMissed(board: BoardCell[][]): BoardCell[] {
    return board.flat().filter(x => x.value == 3);
  }

  
  public getPotentialTargets(
    forbidden: BoardCell[],
    board: BoardCell[][]
  ): BoardCell[] {
    let list: BoardCell[] = [];
    let sideLineCells: BoardCell[] = this.getSideCells(
      this.getCurrentHits(board)
    );

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

  public addPossibleTargetsToAvoidList(
    avoid: BoardCell[],
    possibleTargets: BoardCell[]
  ): BoardCell[] {
    return avoid.push.apply(avoid, possibleTargets);
  }

  public getBoardTargetArray(): BoardCell[] {
    let list: BoardCell[] = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        let cell: BoardCell = { col: i, row: j, value: 0 } as BoardCell;
        list.push(cell);
      }
    }

    return list;
  }

  private getRandomBoardCoordinates(
    forbiddenCells: BoardCell[],
    possibleTargets: BoardCell[]
  ): Coordinates {
    let isRandomCoordinateForbidden: boolean = true;
    let randomCoordinates: Coordinates;
    while (isRandomCoordinateForbidden) {
      randomCoordinates =
        possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
      if (!this.checkIfRandomIsForbidden(forbiddenCells, randomCoordinates)) {
        isRandomCoordinateForbidden = false;
      }
    }

    return randomCoordinates;
  }

  public checkIfRandomIsForbidden(
    cells: BoardCell[],
    coord: Coordinates
  ): boolean {
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].row == coord.row && cells[i].col == coord.col) {
        return true;
      }
    }

    return false;
  }

  public updateCellsToBeAvoided(
    haveShipsWithMoreMasts: boolean,
    possibleTargets: BoardCell[]
  ) {
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
    if (
      this.game.isShootingShipAndNotLowDifficulty(
        possibleTargets,
        haveShipsWithMoreMasts,
        mastCounter
      )
    ) {
      return this.getRandomBoardCoordinates(forbiddenCells, possibleTargets);
    } else {
      let boardTargets: BoardCell[] = this.getBoardTargetArray();
      return this.getRandomBoardCoordinates(forbiddenCells, boardTargets);
    }
  }

  public getEmptyCells(board: BoardCell[][]): BoardCell[] {
    let emptyCells: BoardCell[];

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (board[i][j].value == 0) {
          emptyCells.push(board[i][j]);
        }
      }
    }

    return emptyCells;
  }

  public getDeployCoordinates(board: BoardCell[][], ship: ShipComponent): Coordinates {
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

      this.checkHoveredElement(
        board,
        'cell',
        coord,
        dummyHtmlElement,
        ship
      );

      emptyCellArray.splice(randomIndex, 1);
    }

    return coord;
  }

  //damn

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

    let dropCells: Array<BoardCell> = this.getShipsDropCells(board, coord, nextShip);
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
}
