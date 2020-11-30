import { Injectable } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';

@Injectable()
export class PlayerService {
  constructor(private auth: AuthService, private game: GameService) {}

  public getPlayerNumber(): number {
    let userName: string = this.auth.getAuth().user;
    let playerNames: Array<string> = [
      this.game.getGame().players[0].userName,
      this.game.getGame().players[1].userName,
    ];

    return playerNames.indexOf(userName);
  }
}
