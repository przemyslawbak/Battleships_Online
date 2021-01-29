import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BoardCell } from '@models/board-cell.model';
import { GameState } from '@models/game-state.model';
import { Player } from '@models/player.model';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class GameService {
  private gameState: GameState;
  public gameStateChange: Subject<GameState> = new Subject<GameState>();

  constructor(private router: Router, private auth: AuthService) {}

  public setGame(game: GameState | null): void {
    this.gameState = game;
    if (game) {
      this.gameStateChange.next(this.gameState);
    }
  }

  public getGame(): GameState | null {
    if (this.gameState) {
      return this.gameState;
    }

    return null;
  }

  public isGameStarted(): boolean {
    if (this.gameState) {
      return true;
    }

    return false;
  }

  public isHighDifficultyAndNoMoreMastsButHaveTargets(
    haveShipsWithMoreMasts: boolean,
    possibleTargets: BoardCell[]
  ): boolean {
    if (
      !haveShipsWithMoreMasts &&
      possibleTargets.length > 0 &&
      this.gameState.gameDifficulty == 'hard'
    ) {
      return true;
    }

    return false;
  }

  public isShootingShipAndNotLowDifficulty(
    possibleTargets: BoardCell[],
    haveShipsWithMoreMasts: boolean,
    mastCounter: number
  ): boolean {
    return possibleTargets.length > 0 &&
      mastCounter > 0 &&
      haveShipsWithMoreMasts &&
      !this.isLowDifficulty()
      ? true
      : false;
  }

  private isLowDifficulty() {
    return this.gameState.gameDifficulty == 'easy' ? true : false;
  }

  public getDifficultyValue(value: any): string {
    return value;
  }

  public getJoinTypeValue(value: string): boolean {
    return value == 'open' ? true : false;
  }

  public getSpeedDividerValue(value: string): number {
    switch (value) {
      case 'slow':
        return 1;
      case 'moderate':
        return 2;
      case 'fast':
        return 3;
    }
  }

  public getMultiplayerValue(value: any): boolean {
    return value == 'multi' ? true : false;
  }

  public setPlayerNames(
    players: Player[],
    userName: string,
    displayName: string
  ): Player[] {
    if (players[0].userName == '') {
      players[0].userName = userName;
      players[0].displayName = displayName;
    } else {
      players[1].userName = userName;
      players[1].displayName = displayName;
    }

    return players;
  }

  public getUsersNames(players: Player[]): string[] {
    return [players[0].userName, players[1].userName];
  }

  public findIdAndReconnect(): void {
    if (this.isGameStarted()) {
      this.router.navigate(['connect-game/' + this.getGame().gameId]);
    } else {
      this.router.navigate(['start-game']);
    }
  }

  public isGameAlreadyPlayed(gameUsersNames: string[]) {
    let userName = this.auth.getAuth().user;
    return gameUsersNames.includes(userName);
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

  public checkForEmptySlots(players: Player[]): boolean {
    let gameUserNames: string[] = this.getUsersNames(players);
    return gameUserNames.includes('') ? true : false;
  }

  public async initGame(game: GameState): Promise<void> {
    this.setGame(game); //set first state

    if (game.players[0].isDeployed && game.players[1].isDeployed) {
      this.router.navigate(['play-game']);
    } else {
      this.router.navigate(['deploy-ships']);
    }
  }

  public getDeployCountdownValue(divider: number): number {
    return 180 / divider;
  }

  public isGameSinglePlayer() {
    return this.getGame().gameMulti ? false : true;
  }

  public getPlayersUserNames(): string[] {
    return [
      this.getGame().players[0].userName,
      this.getGame().players[1].userName,
    ];
  }

  public getGameSpeedDivider(): number {
    return this.getGame().gameSpeedDivider;
  }

  public getGameId(): number {
    return this.getGame().gameId;
  }

  public getGamePlayers(): Player[] {
    return this.getGame().players;
  }

  public shouldBeDeployEnabled(length: number): boolean {
    return length < 10 ? false : true;
  }

  public isPlayerDeployed(playerNumber: number): boolean {
    return this.getGame().players[playerNumber].isDeployed;
  }
}
