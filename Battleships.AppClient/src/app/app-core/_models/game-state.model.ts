import { Player } from '@models/player.model';

export interface GameState {
  gameId: number;
  gameTurnNumber: number;
  gameTurnPlayer: number;
  fireRow: number;
  fireCol: number;
  gameMulti: boolean;
  gameOpen: boolean;
  gameSpeedDivider: number;
  gameDifficulty: string;
  displayingResults: boolean;
  fireResult: boolean;
  players: Player[];
  isDeploymentAllowed: boolean;
  isStartAllowed: boolean;
}
