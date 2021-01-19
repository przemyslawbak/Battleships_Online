import { Injectable } from '@angular/core';
import { BoardCell } from '@models/board-cell.model';
import { Coordinates } from '@models/coordinates.model';
import { BoardFiltersService } from './board-filters.service';

@Injectable()
export class RandomizerService {
  constructor(private filters: BoardFiltersService) {}

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
      if (!this.checkIfRandomIsForbidden(forbiddenCells, randomCoordinates)) {
        isRandomCoordinateForbidden = false;
      }
    }

    return randomCoordinates;
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

  public getRandomIndex(emptyCellArray: BoardCell[]): number {
    return Math.floor(Math.random() * Math.floor(emptyCellArray.length));
  }
}
