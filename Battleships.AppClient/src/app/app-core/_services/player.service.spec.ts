import { BoardCell } from '@models/board-cell.model';
import { PlayerService } from '@services/player.service';
import { AuthService } from './auth.service';
import { GameService } from './game.service';

describe('PlayerService', () => {
  let playerService: PlayerService;
  let authService: AuthService;
  let gameService: GameService;

  beforeEach(() => {
    playerService = new PlayerService(authService, gameService);
  });

  it('Service_ShouldBeCreated', () => {
    expect(playerService).toBeTruthy();
  });

  it('checkForWinner_OnHitsArrayLegthOtherThan20_ReturnsFalse', () => {
    let hits: BoardCell[] = [{} as BoardCell];
    let result = playerService.checkForWinner(hits);

    expect(result).toBe(false);
  });

  it('checkForWinner_OnHitsArrayLegth20_ReturnsTrue', () => {
    let hits: BoardCell[] = [];
    for (let i = 0; i < 20; i++) {
      hits.push({} as BoardCell);
    }
    let result = playerService.checkForWinner(hits);

    expect(result).toBe(true);
  });
});
