import { Injectable } from '@angular/core';
import { BoardCell } from '@models/board-cell.model';
import { Coordinates } from '@models/coordinates.model';
import { BoardService } from '@services/board.service';

@Injectable()
export class AiService {
  constructor(private board: BoardService) {}

  public getFireCoordinates(board: BoardCell[][]): Coordinates {
    let hits: BoardCell[] = this.board.getCurrentHits(board); // hit cells
    let missed: BoardCell[] = this.board.getCurrentMissed(board); //missed cells
    let forbidden: BoardCell[] = []; //can not shoot there
    let targets: BoardCell[] = []; //potential targets
    let isRandomCoordinateForbidden: boolean = true;
    let randomCoordinates: Coordinates = {
      row: -1,
      col: -1,
    } as Coordinates;
    forbidden.push.apply(forbidden, this.board.getCornerCells(hits));
    forbidden.push.apply(forbidden, missed);
    forbidden.push.apply(forbidden, hits);
    targets = this.board.getPotentialTargets(forbidden, hits);
    //todo: count hits in line and remove ships from list
    if (targets.length > 0) {
      //todo: DRY
      while (isRandomCoordinateForbidden) {
        randomCoordinates = targets[Math.floor(Math.random() * targets.length)];
        if (!this.checkIfRandomIsForbidden(forbidden, randomCoordinates)) {
          isRandomCoordinateForbidden = false;
        }
      }
      return {
        row: randomCoordinates.row,
        col: randomCoordinates.col,
      } as Coordinates;
    } else {
      //todo: DRY
      while (isRandomCoordinateForbidden) {
        randomCoordinates = this.getRandomCoordinates();
        if (!this.checkIfRandomIsForbidden(forbidden, randomCoordinates)) {
          isRandomCoordinateForbidden = false;
        }
      }

      return randomCoordinates;
    }
  }

  private checkIfRandomIsForbidden(
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

  private getRandomCoordinates(): Coordinates {
    return {
      row: Math.floor(Math.random() * 10),
      col: Math.floor(Math.random() * 10),
    } as Coordinates;
  }
}
