import { BoardCell } from '@models/board-cell.model';
import { GameState } from './../_models/game-state.model';
import { GameService } from './game.service';

describe('GameService', () => {
  let gameService: GameService;

  beforeEach(() => {
    gameService = new GameService();
  });

  it('Service_ShouldBeCreated', () => {
    expect(gameService).toBeTruthy();
  });

  it('setGame_OnGameNotNull_UpdatesGameStateAndGameStateChangeSubject', (done) => {
    expect(gameService).toBeTruthy();
    let oldGame: GameState = { gameId: 1 } as GameState;
    let newGame: GameState = { gameId: 2 } as GameState;
    gameService.setGame(oldGame);
    gameService.gameStateChange.subscribe((game) => {
      expect(game.gameId).toBe(newGame.gameId);
      done();
    });
    gameService.setGame(newGame);
    expect(gameService.getGame().gameId).toBe(newGame.gameId);
  });

  it('setGame_OnGameNull_UpdatesGameStateAndNotUpdatesGameStateChangeSubject', () => {
    expect(gameService).toBeTruthy();
    let oldGame: GameState = { gameId: 1 } as GameState;
    let newGame: GameState = null;
    gameService.setGame(oldGame);
    gameService.setGame(newGame);
    gameService.gameStateChange.subscribe((game) => {
      expect(game.gameId).toBe(oldGame.gameId);
    });
    expect(gameService.getGame()).toBeNull;
  });

  it('getGame_OnGameNull_ReturnsNull', () => {
    let game: GameState = null;
    gameService.setGame(game);
    let result: GameState = gameService.getGame();

    expect(result).toBeNull;
  });

  it('getGame_OnGameObject_ReturnsGameObject', () => {
    let game: GameState = { gameId: 1 } as GameState;
    gameService.setGame(game);
    let result: GameState = gameService.getGame();

    expect(result.gameId).toBe(game.gameId);
  });

  it('isGameStarted_OnGameNull_ReturnsFalse', () => {
    let game: GameState = null;
    gameService.setGame(game);
    let result: boolean = gameService.isGameStarted();

    expect(result).toBe(false);
  });

  it('isGameStarted_OnGameObject_ReturnsTrue', () => {
    let game: GameState = { gameId: 1 } as GameState;
    gameService.setGame(game);
    let result: boolean = gameService.isGameStarted();

    expect(result).toBe(true);
  });

  it('isHighDifficultyAndNoMoreMastsButHaveTargets_OnProperParams_ReturnsTrue', () => {
    let game: GameState = { gameDifficulty: 'hard' } as GameState;
    let haveShipsWithMoreMasts: boolean = false;
    let possibleTargets: BoardCell[] = [{} as BoardCell];
    gameService.setGame(game);
    let result: boolean = gameService.isHighDifficultyAndNoMoreMastsButHaveTargets(
      haveShipsWithMoreMasts,
      possibleTargets
    );

    expect(result).toBe(true);
  });

  it('isHighDifficultyAndNoMoreMastsButHaveTargets_OnHavingMoreMasts_ReturnsFalse', () => {
    let game: GameState = { gameDifficulty: 'hard' } as GameState;
    let haveShipsWithMoreMasts: boolean = true;
    let possibleTargets: BoardCell[] = [{} as BoardCell];
    gameService.setGame(game);
    let result: boolean = gameService.isHighDifficultyAndNoMoreMastsButHaveTargets(
      haveShipsWithMoreMasts,
      possibleTargets
    );

    expect(result).toBe(false);
  });

  it('isHighDifficultyAndNoMoreMastsButHaveTargets_OnNoMoreTargets_ReturnsFalse', () => {
    let game: GameState = { gameDifficulty: 'hard' } as GameState;
    let haveShipsWithMoreMasts: boolean = false;
    let possibleTargets: BoardCell[] = [];
    gameService.setGame(game);
    let result: boolean = gameService.isHighDifficultyAndNoMoreMastsButHaveTargets(
      haveShipsWithMoreMasts,
      possibleTargets
    );

    expect(result).toBe(false);
  });

  it('isHighDifficultyAndNoMoreMastsButHaveTargets_OnDifficultyOtherThanHard_ReturnsFalse', () => {
    let game: GameState = { gameDifficulty: 'medium' } as GameState;
    let haveShipsWithMoreMasts: boolean = false;
    let possibleTargets: BoardCell[] = [{} as BoardCell];
    gameService.setGame(game);
    let result: boolean = gameService.isHighDifficultyAndNoMoreMastsButHaveTargets(
      haveShipsWithMoreMasts,
      possibleTargets
    );

    expect(result).toBe(false);
  });

  it('isShootingShipAndNotLowDifficulty_OnProperParams_ReturnsTrue', () => {
    let game: GameState = { gameDifficulty: 'medium' } as GameState;
    let possibleTargets: BoardCell[] = [{} as BoardCell];
    let haveShipsWithMoreMasts: boolean = true;
    let mastsCounter: number = 1;
    gameService.setGame(game);
    let result: boolean = gameService.isShootingShipAndNotLowDifficulty(
      possibleTargets,
      haveShipsWithMoreMasts,
      mastsCounter
    );

    expect(result).toBe(true);
  });

  it('isShootingShipAndNotLowDifficulty_OnLowDifficulty_ReturnsFalse', () => {
    let game: GameState = { gameDifficulty: 'low' } as GameState;
    let possibleTargets: BoardCell[] = [{} as BoardCell];
    let haveShipsWithMoreMasts: boolean = true;
    let mastsCounter: number = 1;
    gameService.setGame(game);
    let result: boolean = gameService.isShootingShipAndNotLowDifficulty(
      possibleTargets,
      haveShipsWithMoreMasts,
      mastsCounter
    );

    expect(result).toBe(false);
  });

  it('isShootingShipAndNotLowDifficulty_OnEmptyTargetsArray_ReturnsFalse', () => {
    let game: GameState = { gameDifficulty: 'medium' } as GameState;
    let possibleTargets: BoardCell[] = [];
    let haveShipsWithMoreMasts: boolean = true;
    let mastsCounter: number = 1;
    gameService.setGame(game);
    let result: boolean = gameService.isShootingShipAndNotLowDifficulty(
      possibleTargets,
      haveShipsWithMoreMasts,
      mastsCounter
    );

    expect(result).toBe(false);
  });

  it('isShootingShipAndNotLowDifficulty_OnMastsCounterZero_ReturnsFalse', () => {
    let game: GameState = { gameDifficulty: 'medium' } as GameState;
    let possibleTargets: BoardCell[] = [{} as BoardCell];
    let haveShipsWithMoreMasts: boolean = true;
    let mastsCounter: number = 0;
    gameService.setGame(game);
    let result: boolean = gameService.isShootingShipAndNotLowDifficulty(
      possibleTargets,
      haveShipsWithMoreMasts,
      mastsCounter
    );

    expect(result).toBe(false);
  });

  it('isShootingShipAndNotLowDifficulty_OnHaveNotMoreMasts_ReturnsFalse', () => {
    let game: GameState = { gameDifficulty: 'medium' } as GameState;
    let possibleTargets: BoardCell[] = [{} as BoardCell];
    let haveShipsWithMoreMasts: boolean = false;
    let mastsCounter: number = 2;
    gameService.setGame(game);
    let result: boolean = gameService.isShootingShipAndNotLowDifficulty(
      possibleTargets,
      haveShipsWithMoreMasts,
      mastsCounter
    );

    expect(result).toBe(false);
  });
});
