import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@environments/environment';

import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';
import { HttpService } from '@services/http.service';
import { ModalService } from '@services/modal.service';

import { GameState } from '@models/game-state.model';
import { Player } from '@models/player.model';
import { SignalRService } from '@services/signal-r.service';

@Component({
  templateUrl: './game-connect.component.html',
  styleUrls: ['./game-connect.component.css'],
})
export class GameConnectComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private game: GameService,
    private router: Router,
    private http: HttpService,
    private modalService: ModalService,
    private signalRService: SignalRService
  ) {}

  public ngOnInit(): void {
    const id: string = this.route.snapshot.paramMap.get('id');
    const url: string = environment.apiUrl + 'api/game/join?id=' + id;

    if (id) {
      this.getGamestateAndRedirect(url);
    } else {
      this.findIdAndReconnect();
    }
  }

  private getGamestateAndRedirect(url: string): void {
    const userName: string = this.auth.getAuth().user;
    const displayName: string = this.auth.getAuth().displayName;

    this.http.getData(url).subscribe((game: GameState) => {
      if (game) {
        this.signalRService.startConnection();
        let gameUserNames: string[] = this.getUserNames(game.players);

        //if game already played by this user
        if (gameUserNames.includes(userName)) {
          this.initGame(game);
        } else {
          //if game is multiplayer or no players assigned
          if (
            game.gameMulti ||
            !this.checkForAnyPlayerConnected(game.players)
          ) {
            //if hame has empty slot
            this.checkForEmptySlots(game, userName, displayName);
          } else {
            this.modalService.open(
              'info-modal',
              'Game is for singe player only.'
            );
          }
        }
      } else {
        this.modalService.open('info-modal', 'Could not find game.');
      }
    });
  }

  private checkForAnyPlayerConnected(players: Player[]): boolean {
    return players[0].userName == '' || players[1].userName == ''
      ? false
      : true;
  }

  private checkForEmptySlots(
    game: GameState,
    userName: string,
    displayName: string
  ): void {
    let gameUserNames: string[] = this.getUserNames(game.players);

    if (gameUserNames.includes('')) {
      game.players = this.setPlayerNames(game.players, userName, displayName);
      this.initGame(game);
      this.signalRService.broadcastChatMessage('Connected to the game.');
    } else {
      this.informAboutNoEmptySlot();
    }
  }

  private initGame(game: GameState): void {
    if (!game.gameMulti) {
      game.players = this.setComputerOpponent(game.players);
    }
    this.game.setGame(game); //set first state
    this.signalRService.broadcastGameState(game);
    if (game.players[0].isDeployed && game.players[1].isDeployed) {
      this.router.navigate(['play-game']);
    } else {
      this.router.navigate(['deploy-ships']);
    }
  }

  private setComputerOpponent(players: Player[]): Player[] {
    for (let i = 0; i < players.length; i++) {
      if (players[i].userName == '') {
        players[i].userName = 'COMPUTER';
        players[i].displayName = 'COMPUTER';

        return players;
      }
    }
  }

  private setPlayerNames(
    players: Player[],
    userName: string,
    displayName: string
  ): Player[] {
    if (players[0].userName === '') {
      players[0].userName = userName;
      players[0].displayName = displayName;
    } else {
      players[1].userName = this.auth.getAuth().user;
      players[1].displayName = displayName;
    }

    return players;
  }

  private informAboutNoEmptySlot(): void {
    this.modalService.open(
      'info-modal',
      'There is no empty player slot available.'
    );
    this.router.navigate(['open-game']);
  }

  private getUserNames(players: Player[]): string[] {
    return [players[0].userName, players[1].userName];
  }

  private findIdAndReconnect(): void {
    if (this.game.isGameStarted()) {
      this.router.navigate(['connect-game/' + this.game.getGame().gameId]);
    } else {
      this.router.navigate(['start-game']);
    }
  }
}
