import { GameState } from './../_models/game-state.model';
import { Injectable } from '@angular/core';
import { ModalService } from './modal.service';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { GameService } from './game.service';
import { SignalRService } from './signal-r.service';

@Injectable()
export class GameInitializerService {
  constructor(
    private modalService: ModalService,
    private router: Router,
    private auth: AuthService,
    private game: GameService,
    private signalRService: SignalRService
  ) {}

  //todo: unit test all

  public async initGame(
    game: GameState,
    isAlreadyPlayed: boolean,
    isMulti: boolean,
    isEmptySlot: boolean
  ) {
    const userName: string = this.auth.getAuth().user;
    const displayName: string = this.auth.getAuth().displayName;
    if (!game) {
      this.informAboutGameNotFound();
      return;
    }
    if (game && !isMulti) {
      this.informAboutSinglePlayerGame();
      return;
    }
    if (game && isAlreadyPlayed) {
      this.goToInit(game);
      return;
    }
    if (game && !isAlreadyPlayed && isMulti && isEmptySlot) {
      game.players = this.game.setPlayerNames(
        game.players,
        userName,
        displayName
      );
      await this.signalRService.startConnection();
      this.goToInit(game);
      return;
    }
    if (game && isMulti && !isEmptySlot) {
      this.informAboutNoEmptySlot();
      return;
    }
  }

  private informAboutGameNotFound() {
    this.router.navigate(['']).then(() => {
      this.modalService.open('info-modal', 'Could not find game.');
    });
  }

  private informAboutSinglePlayerGame() {
    this.router.navigate(['']).then(() => {
      this.modalService.open('info-modal', 'Game is for singe player only.');
    });
  }

  private informAboutNoEmptySlot(): void {
    this.router.navigate(['']).then(() => {
      this.modalService.open(
        'info-modal',
        'There is no empty player slot available.'
      );
    });
  }

  private goToInit(game: GameState) {
    this.checkForMultiplayer(game);
    this.game.initGame(game);
  }

  private checkForMultiplayer(game: GameState) {
    if (!game.gameMulti) {
      game.players = this.game.setComputerOpponent(game.players);
    } else {
      this.signalRService.broadcastChatMessage('Connected to the game.');
    }
  }
}
