import { Player } from '@models/player.model';

export enum GameStage {
  Deploying,
  Playing,
}

export interface GameState {
  gameId: number;
  gameTurnNumber: number;
  gameAi: boolean;
  gameMulti: boolean;
  gameOpen: boolean;
  gameLink: boolean;
  gameStage: GameStage;
  players: Player[];
  isDeploymentAllowed: boolean;
  isStartAllowed: boolean;
}
