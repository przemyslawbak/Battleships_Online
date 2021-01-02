import { Player } from '@models/player.model';

export interface GameState {
  gameId: number;
  gameTurnNumber: number;
  gameTurnPlayer: number;
  gameSpeed: number;
  gameDifficulty: string;
  gameMulti: boolean;
  gameOpen: boolean;
  displayingResults: boolean;
  fireResult: boolean;
  fireRow: number;
  fireCol: number;
  players: Player[];
  isDeploymentAllowed: boolean;
  isStartAllowed: boolean;
}
