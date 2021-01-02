import { GameService } from '@services/game.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'game-setup',
  templateUrl: './game-setup.component.html',
  styleUrls: ['./game-setup.component.css'],
})
export class GameSetupComponent implements OnInit {
  public gameDifficulty: string = 'n/a';
  public gameSpeed: string = 'n/a';
  public gameMode: string = 'n/a';
  public gameJoining: string = 'n/a';
  constructor(private game: GameService) {}

  public ngOnInit(): void {
    let game = this.game.getGame();
    this.gameDifficulty = this.getDifficulty(
      game.gameDifficulty,
      game.gameMulti
    );
    this.gameSpeed = this.getSpeed(game.gameSpeedDivider);
    this.gameMode = this.getMode(game.gameMulti);
    this.gameJoining = this.getJoining(game.gameOpen, game.gameMulti);
  }

  private getJoining(gameOpen: boolean, gameMulti: boolean): string {
    if (gameMulti) {
      if (gameOpen) {
        return 'Open for all';
      }

      return 'Join by link only';
    }

    return 'n/a'; //single player
  }

  private getMode(gameMulti: boolean): string {
    if (gameMulti) {
      return 'Multi player';
    }

    return 'Single player'; //single player
  }

  private getSpeed(gameSpeedDivider: number): string {
    if (gameSpeedDivider == 1) {
      return 'Slow';
    } else if (gameSpeedDivider == 2) {
      return 'Moderate';
    }
    return 'Fast'; //== 3
  }

  private getDifficulty(gameDifficulty: string, gameMulti: boolean): string {
    if (!gameMulti) {
      return gameDifficulty.charAt(0).toUpperCase() + gameDifficulty.slice(1);
    }

    return 'n/a'; //multi player
  }
}
