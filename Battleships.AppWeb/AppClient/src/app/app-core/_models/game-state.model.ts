export enum GameStage {
  Deploying = 'Deploying ships',
  Playing = 'Game started',
}

export enum WhoseTurn {
  Host = 'Host',
  Guest = 'Guest',
}

export interface GameState {
  gameAi: boolean;
  gameMulti: boolean;
  gameOpen: boolean;
  gameLink: boolean;
  gameId: number;
  gameStage: GameStage;
  gameTurnPlayer: WhoseTurn;
  gameTurnNumber: number;
  player1Fleet: boolean[][];
  player2Fleet: boolean[][];
  host: string;
  guest: string;
}
