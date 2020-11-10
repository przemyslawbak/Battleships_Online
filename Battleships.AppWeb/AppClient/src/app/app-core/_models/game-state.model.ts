export enum GameStage {
  Deploying = 'Deploying ships',
  Playing = 'Game started',
}

export enum WhoseTurn {
  Player1 = 'Player 1',
  Player2 = 'Player 2',
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
  playersDisplay: string[];
  playersNames: string[];
  boardP1: number[][];
  boardP2: number[][];
}
