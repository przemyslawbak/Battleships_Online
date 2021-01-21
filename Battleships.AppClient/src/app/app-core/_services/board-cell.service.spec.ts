import { BoardCell } from '@models/board-cell.model';
import { BoardCellService } from './board-cell.service';
import { Coordinates } from '@models/coordinates.model';
import { toBase64String } from '@angular/compiler/src/output/source_map';

describe('BoardCellService', () => {
  let initialBoard: BoardCell[][];
  let cellService: BoardCellService;

  beforeEach(() => {
    initialBoard = [
      [
        { row: 0, col: 0, value: 1 } as BoardCell,
        { row: 1, col: 0, value: 0 } as BoardCell,
      ],
      [{} as BoardCell],
    ];
    cellService = new BoardCellService();
  });

  it('Service_ShouldBeCreated', () => {
    expect(cellService).toBeTruthy();
  });

  it('validateCellBoundary_OnModelValuesWithinBoundaries_ReturnsTrue', () => {
    let cell: BoardCell = { row: 5, col: 5, value: 3 } as BoardCell;
    let result = cellService.validateCellBoundary(cell);

    expect(result).toBe(true);
  });

  it('validateCellBoundary_OnModelColTooBig_ReturnsFalse', () => {
    let cell: BoardCell = { row: 5, col: 10, value: 3 } as BoardCell;
    let result = cellService.validateCellBoundary(cell);

    expect(result).toBe(false);
  });

  it('validateCellBoundary_OnModelColTooSmall_ReturnsFalse', () => {
    let cell: BoardCell = { row: 5, col: -1, value: 3 } as BoardCell;
    let result = cellService.validateCellBoundary(cell);

    expect(result).toBe(false);
  });

  it('validateCellBoundary_OnModelRowTooBig_ReturnsFalse', () => {
    let cell: BoardCell = { row: 10, col: 5, value: 3 } as BoardCell;
    let result = cellService.validateCellBoundary(cell);

    expect(result).toBe(false);
  });

  it('validateCellBoundary_OnModelRowTooSmall_ReturnsFalse', () => {
    let cell: BoardCell = { row: -1, col: 5, value: 3 } as BoardCell;
    let result = cellService.validateCellBoundary(cell);

    expect(result).toBe(false);
  });

  it('validateCellBoundary_OnModelValueTooBig_ReturnsFalse', () => {
    let cell: BoardCell = { row: 5, col: 5, value: 4 } as BoardCell;
    let result = cellService.validateCellBoundary(cell);

    expect(result).toBe(false);
  });

  it('validateCellBoundary_OnModelValueTooSmall_ReturnsFalse', () => {
    let cell: BoardCell = { row: 5, col: 5, value: -1 } as BoardCell;
    let result = cellService.validateCellBoundary(cell);

    expect(result).toBe(false);
  });

  it('getCell_OnCellWithinBoardBoundaryAndNotRotated_ReturnsValidCellWithColChanged', () => {
    let result = cellService.getCell(0, 1, {
      row: 5,
      col: 5,
    } as Coordinates);

    expect(result).toBeTruthy;
    expect(result.col).toBe(6);
    expect(result.row).toBe(5);
    expect(result.value).toBe(0);
  });

  it('getCell_OnCellWithinBoardBoundaryAndRotated_ReturnsValidCellWithRowChanged', () => {
    let result = cellService.getCell(90, 1, {
      row: 5,
      col: 5,
    } as Coordinates);

    expect(result).toBeTruthy;
    expect(result.col).toBe(5);
    expect(result.row).toBe(6);
    expect(result.value).toBe(0);
  });

  it('getCell_OnCellOutOfBoardBoudary_ReturnsInvalidCell', () => {
    let result = cellService.getCell(90, 1, {
      row: 10,
      col: 10,
    } as Coordinates);

    expect(result).toBeTruthy;
    expect(result.col).toBe(-1);
    expect(result.row).toBe(-1);
    expect(result.value).toBe(-1);
  });

  it('isCellShotBefore_OnCellValueTwo_ReturnsTrue', () => {
    let result = cellService.isCellShotBefore(
      {
        row: 0,
        col: 0,
      } as Coordinates,
      [[{ row: 0, col: 0, value: 2 } as BoardCell]]
    );

    expect(result).toBe(true);
  });

  it('isCellShotBefore_OnCellValueThree_ReturnsTrue', () => {
    let result = cellService.isCellShotBefore(
      {
        row: 0,
        col: 0,
      } as Coordinates,
      [[{ row: 0, col: 0, value: 3 } as BoardCell]]
    );

    expect(result).toBe(true);
  });

  it('isCellShotBefore_OnCellValueOne_ReturnsFalse', () => {
    let result = cellService.isCellShotBefore(
      {
        row: 0,
        col: 0,
      } as Coordinates,
      [[{ row: 0, col: 0, value: 1 } as BoardCell]]
    );

    expect(result).toBe(false);
  });

  it('isCellShotBefore_OnCellValueZero_ReturnsFalse', () => {
    let result = cellService.isCellShotBefore(
      {
        row: 0,
        col: 0,
      } as Coordinates,
      [[{ row: 0, col: 0, value: 0 } as BoardCell]]
    );

    expect(result).toBe(false);
  });

  it('clearDropedCellsValues_OnCellValues_SetsCorrectColor', () => {
    let dropCells: BoardCell[] = [
      { col: 0, row: 0, value: 1 } as BoardCell,
      { col: 0, row: 1, value: 0 } as BoardCell,
    ];
    let result = cellService.clearDropedCellsValues(initialBoard, dropCells);

    expect(result[0][0].color).toBe('green');
    expect(result[0][1].color).toBe('rgba(0, 162, 255, 0.2)');
  });

  it('resetElementsBackground_OnCellValues_SetsCorrectColor', () => {
    let cellWithValue1: BoardCell = { row: 0, col: 0, value: 1 } as BoardCell;
    let cellWithValue0: BoardCell = { row: 0, col: 0, value: 0 } as BoardCell;
    let dummyHtmlElement1: HTMLElement = document.createElement('DIV');
    let dummyHtmlElement0: HTMLElement = document.createElement('DIV');
    dummyHtmlElement1.style.backgroundColor = 'pink';
    dummyHtmlElement0.style.backgroundColor = 'pink';
    let result1 = cellService.resetElementsBackground(
      dummyHtmlElement1,
      cellWithValue1
    );
    let result0 = cellService.resetElementsBackground(
      dummyHtmlElement0,
      cellWithValue0
    );

    expect(result1.style.backgroundColor).toBe('green');
    expect(result0.style.backgroundColor).toBe('rgba(0, 162, 255, 0.2)');
  });
});
