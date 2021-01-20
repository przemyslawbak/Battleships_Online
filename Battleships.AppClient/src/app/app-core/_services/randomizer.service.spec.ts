import { BoardCell } from '@models/board-cell.model';
import { RandomizerService } from './randomizer.service';
import { Coordinates } from '@models/coordinates.model';

describe('RandomizerService', () => {
  let randomizerService: RandomizerService;
  const cellServiceMock = jasmine.createSpyObj('BoardCellService', [
    'filterIsCellAllowed',
  ]);

  beforeEach(() => {
    randomizerService = new RandomizerService(cellServiceMock);
  });

  it('Service_ShouldBeCreated', () => {
    expect(randomizerService).toBeTruthy();
  });

  it('getRandomBoardCoordinates_OnFilterIsCellAllowedReturnsEmptyArray_GivesAResult', () => {
    cellServiceMock.filterIsCellAllowed.and.returnValue([]);
    let result: Coordinates = randomizerService.getRandomBoardCoordinates(
      [{} as BoardCell],
      [{ row: 2, col: 3 } as BoardCell]
    );

    expect(result).toBeTruthy;
    expect(result.row).toBe(2);
    expect(result.col).toBe(3);
  });
});
