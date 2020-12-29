import { Injectable } from '@angular/core';
import { BoardCell } from '@models/board-cell.model';
import { Coordinates } from '@models/coordinates.model';
import { BoardService } from '@services/board.service';

@Injectable()
export class AiService {
  public hit: boolean = false;
  private opponentsFleet: number[] = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
  private mastCounter: number = 0;
  private avoid: BoardCell[] = [];
  constructor(private board: BoardService) {}

  public getFireCoordinates(board: BoardCell[][]): Coordinates {
    console.clear();
    let hits: BoardCell[] = this.board.getCurrentHits(board); // hit cells
    let missed: BoardCell[] = this.board.getCurrentMissed(board); //missed cells
    let forbidden: BoardCell[] = []; //can not shoot there
    let targets: BoardCell[] = []; //potential targets after hit
    let isRandomCoordinateForbidden: boolean = true;
    let randomCoordinates: Coordinates = {
      row: -1,
      col: -1,
    } as Coordinates;
    forbidden.push.apply(forbidden, this.board.getCornerCells(hits));
    forbidden.push.apply(forbidden, missed);
    forbidden.push.apply(forbidden, hits);
    forbidden.push.apply(forbidden, this.avoid);
    targets = this.board.getPotentialTargets(forbidden, hits);
    if (this.hit) {
      this.mastCounter++;
    } else if (!this.hit && targets.length == 0) {
      if (this.mastCounter > 0) {
        //remove ship from array
        this.removeShipFromArray(this.mastCounter);
        this.mastCounter = 0;
      }
    }

    let haveMoreMasts: boolean = this.isPossibleMoreMasts();
    if (!haveMoreMasts && targets.length > 0) {
      this.avoid.push.apply(this.avoid, targets);
    }

    //if there are targets, shooting ship, possible more masts
    if (targets.length > 0 && this.mastCounter > 0 && haveMoreMasts) {
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

  private removeShipFromArray(mastCounter: number) {
    const index = this.opponentsFleet.indexOf(mastCounter);
    if (index > -1) {
      this.opponentsFleet.splice(index, 1);
    }
  }

  private isPossibleMoreMasts(): boolean {
    let res: boolean = false;
    if (this.mastCounter > 0) {
      for (let i = 1; i < 4; i++) {
        if (this.opponentsFleet.indexOf(this.mastCounter + i) > -1) {
          res = true;
        }
      }
    }
    if (!res) {
      this.removeShipFromArray(this.mastCounter);
      this.mastCounter = 0;
    }

    return res;
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
