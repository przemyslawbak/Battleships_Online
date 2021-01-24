import { Injectable } from '@angular/core';
import { BoardCell } from '@models/board-cell.model';
import { Coordinates } from '@models/coordinates.model';
import { BoardCellService } from './board-cell.service';

@Injectable()
export class RandomizerService {
  constructor(private cells: BoardCellService) {}

  public randomHalf(): boolean {
    return Math.random() < 0.5;
  }

  public getRandomBoardCoordinates(
    forbiddenCells: BoardCell[],
    possibleTargets: BoardCell[]
  ): Coordinates {
    let isRandomCoordinateForbidden: boolean = true;
    let randomCoordinates: Coordinates;
    while (isRandomCoordinateForbidden) {
      let index = Math.floor(Math.random() * possibleTargets.length);
      randomCoordinates = possibleTargets[index];
      if (
        this.cells.filterIsCellAllowed(forbiddenCells, randomCoordinates)
          .length == 0
      ) {
        isRandomCoordinateForbidden = false;
      }
    }

    return randomCoordinates;
  }

  public getRandomIndex(emptyCellArray: BoardCell[]): number {
    return Math.floor(Math.random() * Math.floor(emptyCellArray.length));
  }

  public getUniqueId(): number {
    let min = Math.ceil(100000000);
    let max = Math.floor(999999999);
    return Math.floor(Math.random() * (max - min) + min);
  }
}
