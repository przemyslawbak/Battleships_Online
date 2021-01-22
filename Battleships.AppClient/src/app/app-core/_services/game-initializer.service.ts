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
    isPlayed: boolean,
    isMulti: boolean,
    isEmptySlot: boolean
  ) {
    if (game) {
      await this.signalRService.startConnection(); // see if it works?????????
      const userName: string = this.auth.getAuth().user;
      const displayName: string = this.auth.getAuth().displayName;
      if (isPlayed) {
        this.goForInit(game);
      } else {
        if (isMulti) {
          if (isEmptySlot) {
            game.players = this.game.setPlayerNames(
              game.players,
              userName,
              displayName
            );
            this.goForInit(game);
          } else {
            this.informAboutNoEmptySlot();
          }
        } else {
          this.modalService.open(
            'info-modal',
            'Game is for singe player only.'
          );
        }
      }
    } else {
      this.router.navigate(['']).then(() => {
        this.modalService.open('info-modal', 'Could not find game.');
      });
    }
  }
  goForInit(game: GameState) {
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

  private informAboutNoEmptySlot(): void {
    this.modalService.open(
      'info-modal',
      'There is no empty player slot available.'
    );
    this.router.navigate(['open-game']);
  }
}
