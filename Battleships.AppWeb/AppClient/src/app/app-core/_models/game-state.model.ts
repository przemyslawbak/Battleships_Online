import { Player } from '@models/player.model';

export interface GameState {
  gameId: number;
  gameTurnNumber: number;
  gameTurnPlayer: number;
  gameAi: boolean;
  gameMulti: boolean;
  gameOpen: boolean;
  gameLink: boolean;
  displayingResults: boolean;
  fireResult: boolean;
  players: Player[];
  isDeploymentAllowed: boolean;
  isStartAllowed: boolean;
}
