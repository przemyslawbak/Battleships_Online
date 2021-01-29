import { BoardCell } from '@models/board-cell.model';
import { Player } from '@models/player.model';
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

  it('findComputerPlayerNumber_OnComputersName_ReturnPlayerNumber', () => {
    let players: Player[] = [
      { userName: 'COMPUTER' } as Player,
      { userName: 'human' } as Player,
    ];
    let result: number = playerService.findComputerPlayerNumber(players);

    expect(result).toBe(0);
  });

  it('findComputerPlayerNumber_OnComputersName_ReturnPlayerNumber', () => {
    let players: Player[] = [
      { userName: 'COMPUTER' } as Player,
      { userName: 'human' } as Player,
    ];
    let result: number = playerService.findComputerPlayerNumber(players);

    expect(result).toBe(0);
  });

  it('arePlayersDeployed_OnBothDeployed_ReturnsTrue', () => {
    let players: Player[] = [
      { isDeployed: true } as Player,
      { isDeployed: true } as Player,
    ];
    let result: boolean = playerService.arePlayersDeployed(players);

    expect(result).toBe(true);
  });

  it('arePlayersDeployed_OnAnyNotDeployed_ReturnsFalse', () => {
    let players: Player[] = [
      { isDeployed: false } as Player,
      { isDeployed: true } as Player,
    ];
    let result: boolean = playerService.arePlayersDeployed(players);

    expect(result).toBe(false);
  });
});
