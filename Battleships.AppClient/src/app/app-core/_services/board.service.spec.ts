import { BoardCell } from '@models/board-cell.model';
import { Player } from '@models/player.model';
import { ShipComponent } from 'app/app-game/game-ship/ship.component';
import { BoardService } from './board.service';
import { Coordinates } from '@models/coordinates.model';

describe('CommentsService', () => {
  let boardService: BoardService;
  let initialBoard: BoardCell[][];
  const gameServiceMock = jasmine.createSpyObj('GameService', [
    'isHighDifficultyAndNoMoreMastsButHaveTargets',
    'isShootingShipAndNotLowDifficulty',
  ]);
  const playerServiceMock = jasmine.createSpyObj('PlayerService', [
    'checkForWinner',
  ]);
  const randomizerServiceMock = jasmine.createSpyObj('RandomizerService', [
    'getRandomBoardCoordinates',
    'getRandomIndex',
  ]);
  const cellsServiceMock = jasmine.createSpyObj('CellsService', [
    'validateCellBoundary',
    'filterHitCells',
    'getEmptyCell',
    'getCornerCells',
    'filterHitCells',
    'filterMissedCells',
    'isCellShotBefore',
    'addCellsToAvoidList',
    'getSideCells',
    'filterTargetCells',
    'filterWrongCells',
    'filterShipCells',
    'filterEmptySeaCells',
    'getForbiddenCells',
    'filterForbiddenCells',
    'filterEmptyBoard',
    'updateHoveredBoardCells',
    'getCell',
    'validateCell',
    'updateDroppedBoardCells',
    'getCellsArray',
    'resetElementsBackground',
    'clearDropCellsValues',
  ]);

  beforeEach(() => {
    initialBoard = [[{} as BoardCell, {} as BoardCell], [{} as BoardCell]];
    boardService = new BoardService(
      gameServiceMock,
      playerServiceMock,
      randomizerServiceMock,
      cellsServiceMock
    );
    cellsServiceMock.addCellsToAvoidList.calls.reset();
    cellsServiceMock.filterEmptyBoard.calls.reset();
  });

  it('Service_ShouldBeCreated', () => {
    expect(boardService).toBeTruthy();
  });

  it('isThereAWinner_OnCheckForWinnerFalse_ReturnsMinusOne', () => {
    let players: Player[] = [{} as Player, {} as Player];
    playerServiceMock.checkForWinner.and.returnValue(false);
    let result = boardService.isThereAWinner(players);

    expect(result).toBe(-1);
  });

  it('isThereAWinner_OnCheckForWinnerTrue_ReturnsZero', () => {
    let players: Player[] = [{} as Player, {} as Player];
    playerServiceMock.checkForWinner.and.returnValue(true);
    let result = boardService.isThereAWinner(players);

    expect(result).toBe(0);
  });

  it('updateCellsToBeAvoided_OnIsHighDifficultyAndNoMoreMastsButHaveTargetsTrue_AddsCells', () => {
    gameServiceMock.isHighDifficultyAndNoMoreMastsButHaveTargets.and.returnValue(
      true
    );
    boardService.updateCellsToBeAvoided(true, [{} as BoardCell]);

    expect(cellsServiceMock.addCellsToAvoidList).toHaveBeenCalledTimes(1);
  });

  it('updateCellsToBeAvoided_OnIsHighDifficultyAndNoMoreMastsButHaveTargetsFalse_NotAddsCells', () => {
    gameServiceMock.isHighDifficultyAndNoMoreMastsButHaveTargets.and.returnValue(
      false
    );
    boardService.updateCellsToBeAvoided(true, [{} as BoardCell]);

    expect(cellsServiceMock.addCellsToAvoidList).toHaveBeenCalledTimes(0);
  });

  it('getShootingCoordinates_OnIsShootingShipAndNotLowDifficultyTrue_CallsFilterEmptyBoardNever', () => {
    gameServiceMock.isShootingShipAndNotLowDifficulty.and.returnValue(true);
    boardService.getShootingCoordinates([], true, 1, []);

    expect(cellsServiceMock.filterEmptyBoard).toHaveBeenCalledTimes(0);
  });

  it('getShootingCoordinates_OnIsShootingShipAndNotLowDifficultyFalse_CallsFilterEmptyBoardOnce', () => {
    gameServiceMock.isShootingShipAndNotLowDifficulty.and.returnValue(false);
    boardService.getShootingCoordinates([], true, 1, []);

    expect(cellsServiceMock.filterEmptyBoard).toHaveBeenCalledTimes(1);
  });

  it('verifyHoveredElement_OnNextShipNull_ReturnsFalse', () => {
    let result: boolean = boardService.verifyHoveredElement([], [], null);

    expect(result).toBe(false);
  });

  it('verifyHoveredElement_OnDropCellsNotMatchingShipSize_ReturnsFalse', () => {
    cellsServiceMock.filterForbiddenCells.and.returnValue([]);
    let result: boolean = boardService.verifyHoveredElement(
      [],
      [{} as BoardCell],
      { size: 2, rotation: 0 } as ShipComponent
    );

    expect(result).toBe(false);
  });

  it('verifyHoveredElement_OnForbiddenCellsFilterGreaterThanZero_ReturnsFalse', () => {
    cellsServiceMock.filterForbiddenCells.and.returnValue([{} as BoardCell]);
    let result: boolean = boardService.verifyHoveredElement(
      [],
      [{} as BoardCell, {} as BoardCell],
      { size: 2, rotation: 0 } as ShipComponent
    );

    expect(result).toBe(false);
  });

  it('verifyHoveredElement_OnCorrectParameters_ReturnsTrue', () => {
    cellsServiceMock.filterForbiddenCells.and.returnValue([]);
    let result: boolean = boardService.verifyHoveredElement(
      [],
      [{} as BoardCell, {} as BoardCell],
      { size: 2, rotation: 0 } as ShipComponent
    );

    expect(result).toBe(true);
  });

  it('updateHoveredElements_OnIsDropAllowedTrue_ReturnsUpdatedBoardAndNotChangesElementsColor', () => {
    let dummyHtmlElement: HTMLElement = document.createElement('DIV');
    dummyHtmlElement.style.backgroundColor = 'green';
    let updatedBoard: BoardCell[][] = [
      [{} as BoardCell, {} as BoardCell],
      [{} as BoardCell, {} as BoardCell],
    ];
    cellsServiceMock.updateHoveredBoardCells.and.returnValue(updatedBoard);
    let result: BoardCell[][] = boardService.updateHoveredElements(
      [],
      initialBoard,
      true,
      dummyHtmlElement
    );

    expect(result).toBe(updatedBoard);
    expect(dummyHtmlElement.style.backgroundColor).toBe('green');
  });

  it('updateHoveredElements_OnIsDropAllowedFalse_ReturnsInitialBoardAndChangesElementsColor', () => {
    let dummyHtmlElement: HTMLElement = document.createElement('DIV');
    dummyHtmlElement.style.backgroundColor = 'green';
    let updatedBoard: BoardCell[][] = [
      [{} as BoardCell, {} as BoardCell],
      [{} as BoardCell, {} as BoardCell],
    ];
    cellsServiceMock.updateHoveredBoardCells.and.returnValue(updatedBoard);
    let result: BoardCell[][] = boardService.updateHoveredElements(
      [],
      initialBoard,
      false,
      dummyHtmlElement
    );

    expect(result).toBe(initialBoard);
    expect(dummyHtmlElement.style.backgroundColor).toBe('red');
  });

  it('deployShipOnBoardAndgetShipsDropCells_OnNextShipNull_CallsUpdateDroppedBoardCellsWithEmptyArrayParam', () => {
    boardService.deployShipOnBoard(initialBoard, {} as Coordinates, null);

    expect(cellsServiceMock.updateDroppedBoardCells).toHaveBeenCalledWith(
      initialBoard,
      []
    );
  });

  it('deployShipOnBoardAndgetShipsDropCells_OnNextShipObjectAndValidCellModels_CallsUpdateDroppedBoardCellsWithArrayParam', () => {
    cellsServiceMock.getCell.and.returnValue({} as BoardCell);
    cellsServiceMock.validateCellBoundary.and.returnValue(true);
    boardService.deployShipOnBoard(
      initialBoard,
      {} as Coordinates,
      { size: 2, rotation: 0 } as ShipComponent
    );

    expect(
      cellsServiceMock.updateDroppedBoardCells
    ).toHaveBeenCalledWith(initialBoard, [{}, {}]);
  });

  it('deployShipOnBoardAndgetShipsDropCells_OnNextShipObjectAndNotValidCellModels_CallsUpdateDroppedBoardCellsWithEmptyArrayParam', () => {
    cellsServiceMock.getCell.and.returnValue({} as BoardCell);
    cellsServiceMock.validateCellBoundary.and.returnValue(false);
    boardService.deployShipOnBoard(
      initialBoard,
      {} as Coordinates,
      { size: 2, rotation: 0 } as ShipComponent
    );

    expect(cellsServiceMock.updateDroppedBoardCells).toHaveBeenCalledWith(
      initialBoard,
      []
    );
  });

  it('isCellAlreadyShot_OnValueFromServiceTrue_ReturnsTrue', () => {
    cellsServiceMock.isCellShotBefore.and.returnValue(true);
    let result = boardService.isCellAlreadyShot(
      {
        row: 0,
        col: 0,
      } as Coordinates,
      [[{ row: 0, col: 0, value: 0 } as BoardCell]]
    );

    expect(result).toBe(true);
  });

  it('isCellAlreadyShot_OnValueFromServiceFalse_ReturnsFalse', () => {
    cellsServiceMock.isCellShotBefore.and.returnValue(false);
    let result = boardService.isCellAlreadyShot(
      {
        row: 0,
        col: 0,
      } as Coordinates,
      [[{ row: 0, col: 0, value: 0 } as BoardCell]]
    );

    expect(result).toBe(false);
  });
});
