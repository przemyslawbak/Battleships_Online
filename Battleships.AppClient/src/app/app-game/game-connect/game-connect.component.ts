import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GameService } from '@services/game.service';
import { HttpService } from '@services/http.service';

import { GameState } from '@models/game-state.model';
import { GameInitializerService } from '@services/game-initializer.service';

@Component({
  templateUrl: './game-connect.component.html',
  styleUrls: ['./game-connect.component.css'],
})
export class GameConnectComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private game: GameService,
    private http: HttpService,
    private initializer: GameInitializerService
  ) {}

  public async ngOnInit(): Promise<void> {
    const id: string = this.route.snapshot.paramMap.get('id');
    this.connectToTheGame(id);
  }

  private connectToTheGame(id: string): void {
    id ? this.getGameStateAndRedirect(id) : this.game.findIdAndReconnect();
  }

  private getGameStateAndRedirect(id: string): void {
    this.http.getGameState(id).subscribe(async (game: GameState) => {
      if (game) {
        let gameUsersNames: string[] = this.game.getUsersNames(game.players);
        let isPlayed: boolean = this.game.isGameAlreadyPlayed(gameUsersNames);
        let isEmptySlot: boolean = this.game.checkForEmptySlots(game.players);
        await this.initializer.initGame(
          game,
          isPlayed,
          game.gameMulti,
          isEmptySlot
        );
      }
    });
  }
}
