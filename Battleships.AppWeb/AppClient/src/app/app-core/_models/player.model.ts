import { ShipComponent } from './../../app-game/game-ship/ship.component';
import { BoardCell } from '@models/board-cell.model';

export interface Player {
  myTurn: boolean;
  fleet: Array<ShipComponent>;
  displayName: string;
  userName: string;
  board: BoardCell[][];
}
