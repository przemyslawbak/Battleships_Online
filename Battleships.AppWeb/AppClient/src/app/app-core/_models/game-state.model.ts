export enum GameStage {
  Deploy,
  Play,
}

export enum WhoseTurn {
  Host,
  Guest,
}

export interface GameState {
  gameAi: boolean;
  gameMulti: boolean;
  gameOpen: boolean;
  gameLink: boolean;
  gameId: number;
  gameStage: GameStage;
  gameTurn: WhoseTurn;
}
