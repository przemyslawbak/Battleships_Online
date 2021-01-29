import { BoardCell } from '@models/board-cell.model';
import { Player } from '@models/player.model';
import { GameState } from './../_models/game-state.model';
import { GameService } from './game.service';

describe('GameService', () => {
  let gameService: GameService;
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  const authMock = jasmine.createSpyObj('AuthService', ['getAuth']);

  beforeEach(() => {
    gameService = new GameService(routerMock, authMock);
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
    let game: GameState = { gameDifficulty: 'easy' } as GameState;
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

  it('getJoinTypeValue_OnParameterOpen_ReturnsTrue', () => {
    let param: string = 'open';
    let result: boolean = gameService.getJoinTypeValue(param);

    expect(result).toBe(true);
  });

  it('getJoinTypeValue_OnParameterOther_ReturnsFalse', () => {
    let param: string = 'any_other';
    let result: boolean = gameService.getJoinTypeValue(param);

    expect(result).toBe(false);
  });

  it('getSpeedDividerValue_OnParamValueSlow_ReturnsOne', () => {
    let param: string = 'slow';
    let result: number = gameService.getSpeedDividerValue(param);
    expect(result).toBe(1);
  });

  it('getSpeedDividerValue_OnParamValueModerate_ReturnsTwo', () => {
    let param: string = 'moderate';
    let result: number = gameService.getSpeedDividerValue(param);
    expect(result).toBe(2);
  });

  it('getSpeedDividerValue_OnParamValueFast_ReturnsThree', () => {
    let param: string = 'fast';
    let result: number = gameService.getSpeedDividerValue(param);
    expect(result).toBe(3);
  });

  it('getMultiplayerValue_OnParamValueMulti_ReturnsTrue', () => {
    let param: string = 'multi';
    let result: boolean = gameService.getMultiplayerValue(param);
    expect(result).toBe(true);
  });

  it('getMultiplayerValue_OnParamValueMulti_ReturnsTrue', () => {
    let param: string = 'any_other';
    let result: boolean = gameService.getMultiplayerValue(param);
    expect(result).toBe(false);
  });

  it('setPlayerNames_OnEmptyName_SetsPlayersName', () => {
    let players: Player[] = [
      { userName: 'occupied' } as Player,
      { userName: '' } as Player,
    ];
    let userName: string = 'Mirondziarlega0001';
    let displayName: string = 'Miron';
    let result: Player[] = gameService.setPlayerNames(
      players,
      userName,
      displayName
    );

    expect(result[1].displayName).toBe(displayName);
    expect(result[1].userName).toBe(userName);
  });

  it('findIdAndReconnect_OnGameNotStarted_NavigatesToStartGameView', () => {
    gameService.setGame(null);
    gameService.findIdAndReconnect();

    expect(routerMock.navigate).toHaveBeenCalledWith(['start-game']);
  });

  it('findIdAndReconnect_OnGameStarted_NavigatesToConnectGame', () => {
    gameService.setGame({ gameId: 666 } as GameState);
    gameService.findIdAndReconnect();

    expect(routerMock.navigate).toHaveBeenCalledWith(['connect-game/666']);
  });

  it('setComputerOpponent_OnEmptyGameSlot_SetsNamesForComputer', () => {
    let players: Player[] = [
      { userName: 'human' } as Player,
      { userName: '' } as Player,
    ];
    let result: Player[] = gameService.setComputerOpponent(players);

    expect(result[1].userName).toBe('COMPUTER');
    expect(result[1].displayName).toBe('COMPUTER');
  });

  it('checkForEmptySlots_OnEmptyPlayerName_ReturnsTrue', () => {
    let players: Player[] = [
      { userName: 'human' } as Player,
      { userName: '' } as Player,
    ];
    let result: boolean = gameService.checkForEmptySlots(players);

    expect(result).toBe(true);
  });

  it('checkForEmptySlots_OnNoEmptyPlayerName_ReturnsFalse', () => {
    let players: Player[] = [
      { userName: 'human' } as Player,
      { userName: 'player' } as Player,
    ];
    let result: boolean = gameService.checkForEmptySlots(players);

    expect(result).toBe(false);
  });

  it('initGame_OnDeployedBothPlayers_NavigatesToGamePlay', async () => {
    let players: Player[] = [
      { isDeployed: true } as Player,
      { isDeployed: true } as Player,
    ];
    let game: GameState = { players } as GameState;
    await gameService.initGame(game);

    expect(routerMock.navigate).toHaveBeenCalledWith(['play-game']);
  });

  it('initGame_OnNoAllPlayersDeployed_NavigatesToGameDeploy', async () => {
    let players: Player[] = [
      { isDeployed: false } as Player,
      { isDeployed: true } as Player,
    ];
    let game: GameState = { players } as GameState;
    await gameService.initGame(game);

    expect(routerMock.navigate).toHaveBeenCalledWith(['deploy-ships']);
  });

  it('isGameSinglePlayer_OnGameMultiplayer_ReturnsFalse', () => {
    gameService.setGame({ gameMulti: true } as GameState);
    let result: boolean = gameService.isGameSinglePlayer();

    expect(result).toBe(false);
  });

  it('isGameSinglePlayer_OnGameNotMultiplayer_ReturnsTrue', () => {
    gameService.setGame({ gameMulti: false } as GameState);
    let result: boolean = gameService.isGameSinglePlayer();

    expect(result).toBe(true);
  });

  it('shouldBeDeployEnabled_OnLegthLessThan10_ReturnsFalse', () => {
    let result: boolean = gameService.shouldBeDeployEnabled(9);

    expect(result).toBe(false);
  });

  it('shouldBeDeployEnabled_OnLegthLessThan10_ReturnsTrue', () => {
    let result: boolean = gameService.shouldBeDeployEnabled(10);

    expect(result).toBe(true);
  });
});
