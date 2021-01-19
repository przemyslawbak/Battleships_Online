import { BoardService } from './board.service';

describe('CommentsService', () => {
  let boardService: BoardService;
  const gameServiceMock = jasmine.createSpyObj('GameService', [
    'isHighDifficultyAndNoMoreMastsButHaveTargets',
    'isShootingShipAndNotLowDifficulty',
  ]);

  beforeEach(() => {
    boardService = new BoardService(gameServiceMock);
  });

  it('Service_ShouldBeCreated', () => {
    expect(boardService).toBeTruthy();
  });
});
