import { ShipComponent } from './../../app-game/game-ship/ship.component';
import { BoardCell } from '@models/board-cell.model';

export interface Player {
  isMyTurn: boolean;
  isDeployed: boolean;
  displayName: string;
  userName: string;
  board: BoardCell[][];
}
