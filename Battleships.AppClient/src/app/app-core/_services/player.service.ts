import { Injectable } from '@angular/core';
import { BoardCell } from '@models/board-cell.model';
import { Player } from '@models/player.model';
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

  public checkForWinner(hits: BoardCell[]): boolean {
    return hits.length == 20 ? true : false;
  }

  //todo: test below

  public findComputerPlayerNumber(players: Player[]): number {
    for (let i = 0; i < players.length; i++) {
      if (players[i].userName == 'COMPUTER') {
        return i;
      }
    }
  }

  public setComputerOpponent(players: Player[]): Player[] {
    for (let i = 0; i < players.length; i++) {
      if (players[i].userName == '') {
        players[i].userName = 'COMPUTER';
        players[i].displayName = 'COMPUTER';

        return players;
      }
    }
  }
}
