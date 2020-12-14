import { Injectable } from '@angular/core';
import { BoardCell } from '@models/board-cell.model';
import { Coordinates } from '@models/coordinates.model';

@Injectable()
export class AiService {
  public getFireCoordCoordinates(board: BoardCell[][]): Coordinates {
    throw new Error('Method not implemented.');
  }
}
