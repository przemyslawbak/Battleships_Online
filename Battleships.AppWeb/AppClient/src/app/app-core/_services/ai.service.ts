import { Injectable } from '@angular/core';
import { BoardCell } from '@models/board-cell.model';
import { Coordinates } from '@models/coordinates.model';
import { BoardService } from '@services/board.service';

@Injectable()
export class AiService {
  constructor(private board: BoardService) {}

  public getFireCoordinates(board: BoardCell[][]): Coordinates {
    let hits: BoardCell[] = this.board.getCurrentHits(board);
    let missed: BoardCell[] = this.board.getCurrentMissed(board);
    let forbidden: BoardCell[] = [];
    let targets: BoardCell[] = [];
    if (hits.length == 0) {
      return {
        row: Math.floor(Math.random() * 10),
        col: Math.floor(Math.random() * 10),
      } as Coordinates;
    } else {
      forbidden.concat(this.board.getCornerCells(hits));
      forbidden.concat(missed);
      forbidden.concat(hits);
      //todo: get / count sanked fleet and add forbidden for side cells
      targets = this.board.getPotentialTargets(forbidden, hits);
      let random: BoardCell =
        targets[Math.floor(Math.random() * targets.length)];
      return { row: random.row, col: random.col } as Coordinates;
    }
  }
}
