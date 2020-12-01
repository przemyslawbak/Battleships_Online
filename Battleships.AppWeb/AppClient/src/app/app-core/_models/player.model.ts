import { ShipComponent } from './../../app-game/game-ship/ship.component';
import { BoardCell } from '@models/board-cell.model';

export interface Player {
  isMyTurn: boolean;
  isDeployed: boolean;
  fleet: Array<ShipComponent>;
  displayName: string;
  userName: string;
  board: BoardCell[][];
}
