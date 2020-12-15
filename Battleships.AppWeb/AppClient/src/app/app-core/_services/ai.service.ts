import { Injectable } from '@angular/core';
import { BoardCell } from '@models/board-cell.model';
import { Coordinates } from '@models/coordinates.model';
import { BoardService } from '@services/board.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AiService {
  constructor(private board: BoardService) {}

  public getFireCoordinates(board: BoardCell[][]): Coordinates {
    let hits: BoardCell[] = this.board.getCurrentHits(board);
    let missed: BoardCell[] = this.board.getCurrentMissed(board);
    let forbidden: BoardCell[] = [];
    let targets: BoardCell[] = [];
    let randomCoordinates: Coordinates = {
      row: -1,
      col: -1,
    } as Coordinates;
    forbidden.push.apply(forbidden, this.board.getCornerCells(hits));
    forbidden.push.apply(forbidden, missed);
    forbidden.push.apply(forbidden, hits);
    console.clear();
    console.log('forbidden cells:');
    console.log(forbidden);
    if (hits.length == 0) {
      let isRandomCoordinateForbidden: boolean = true;
      while (isRandomCoordinateForbidden) {
        randomCoordinates = this.getRandomCoordinates();
        if (!this.checkIfRandomIsForbidden(forbidden, randomCoordinates)) {
          isRandomCoordinateForbidden = false;
        }
      }
      return this.getRandomCoordinates();
    } else {
      targets = this.board.getPotentialTargets(forbidden, hits);
      if (targets.length > 0) {
        let random: BoardCell =
          targets[Math.floor(Math.random() * targets.length)];
        return { row: random.row, col: random.col } as Coordinates;
      } else {
        let isRandomCoordinateForbidden: boolean = true;
        while (isRandomCoordinateForbidden) {
          randomCoordinates = this.getRandomCoordinates();
          if (!this.checkIfRandomIsForbidden(forbidden, randomCoordinates)) {
            isRandomCoordinateForbidden = false;
          }
        }

        return randomCoordinates;
      }
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
