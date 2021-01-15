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
});
