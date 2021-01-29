import { environment } from './../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';

import { ShipComponent } from './../game-ship/ship.component';

import { BoardService } from '@services/board.service';
import { PlayerService } from '@services/player.service';
import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';
import { SignalRService } from '@services/signal-r.service';

import { Coordinates } from '@models/coordinates.model';
import { GameState } from '@models/game-state.model';
import { FleetService } from '@services/fleet.service';
import { AiService } from '@services/ai.service';
import { TextService } from '@services/text.service';
import { BoardCell } from '@models/board-cell.model';

@Component({
  templateUrl: './game-deploy-ships.component.html',
  styleUrls: ['./game-deploy-ships.component.css'],
})
export class GameDeployComponent implements OnInit {
  private speedDivider: number = 1;
  public multiplayer: boolean = false;
  public gameLink: string =
    environment.clientUrl + 'connect-game/' + this.game.getGame().gameId;
  public isDeployed: boolean = false;
  public isDeploymentAllowed: boolean = false;
  public isDeployEnabled: boolean = false;
  public userName: string = '';
  private countDown: Subscription;
  public count: number = 180;
  private _subGame: any;
  private _subBoard: any;

  constructor(
    private router: Router,
    private board: BoardService,
    private auth: AuthService,
    private game: GameService,
    private fleet: FleetService,
    private ai: AiService,
    private text: TextService,
    private signalRService: SignalRService,
    private player: PlayerService
  ) {
    this.isDeployed = false;
    this.fleet.setFleetWaiting = this.fleet.createFleet();
    this.fleet.setFleetDeployed = [];
  }

  ngOnInit(): void {
    if (!this.game.isGameStarted()) {
      this.router.navigate(['']);
    } else {
      this.initDeploying();
    }
  }

  ngOnDestroy(): void {
    if (this._subBoard) {
      this._subBoard.unsubscribe();
    }
    if (this._subGame) {
      this._subGame.unsubscribe();
    }
    if (this.countDown) {
      this.countDown.unsubscribe();
    }
  }

  public getFleetDeployed(): ShipComponent[] {
    return this.fleet.getFleetDeployed;
  }

  public getFleetWaiting(): ShipComponent[] {
    return this.fleet.getFleetWaiting;
  }

  public getPlayersBoard(): BoardCell[][] {
    return this.board.getPlayersBoard;
  }

  private initDeploying(): void {
    this.board.resetAvoidCellsArray();
    this.speedDivider = this.game.getGameSpeedDivider();
    this.count = this.game.getDeployCountdownValue(this.speedDivider);
    this.userName = this.auth.getAuth().user;
    this.startCounter();
    this.initGameSubscription();
    this.board.setPlayersBoard = this.board.getEmptyBoard();
    this.updateGameValues(this.game.getGame());
  }

  private initGameSubscription(): void {
    this._subGame = this.game.gameStateChange.subscribe((game) => {
      this.updateGameValues(game);
    });
  }

  private updateGameValues(game: GameState): void {
    this.isDeploymentAllowed = game.isDeploymentAllowed;
    this.multiplayer = game.gameMulti;
    if (this.player.arePlayersDeployed(game.players)) {
      this.router.navigate(['play-game']);
    } else {
      let aiPlayerNumber: number = this.player.findComputerPlayerNumber(
        game.players
      );
      if (
        this.game.isGameSinglePlayer() &&
        !game.players[aiPlayerNumber].isDeployed
      ) {
        game.isDeploymentAllowed = true;
        game.players = this.ai.setupAiPlayer(
          game.players,
          aiPlayerNumber,
          this.isDeploymentAllowed
        );
        this.signalRService.broadcastGameState(game);
      }
    }
  }

  public setRotation(name: string): void {
    const id: string = this.text.getIdFromElementName(name);
    let item: ShipComponent = this.fleet.getShipListItem(
      name,
      id,
      this.fleet.getFleetWaiting,
      this.fleet.getFleetDeployed
    );
    item.rotation = item.rotation == 0 ? 90 : 0;
  }

  public deployShip(row: number, col: number): void {
    let coord: Coordinates = { row: row, col: col } as Coordinates;
    let isDropAllowed: boolean = this.isDroppingShipAllowed(coord);
    if (isDropAllowed && this.isDeploymentAllowed) {
      this.board.setPlayersBoard = this.board.deployShipOnBoard(
        this.board.getPlayersBoard,
        coord,
        this.fleet.getFleetWaiting[0]
      );
      this.fleet.moveFromWaitingToDeployed();
    }
    this.enableDeployBtnIfPossible();
  }

  private isDroppingShipAllowed(coord: Coordinates): boolean {
    let dropCells = this.board.getShipsDropCells(
      this.board.getPlayersBoard,
      coord,
      this.fleet.getFleetWaiting[0]
    );
    return this.board.verifyHoveredElement(
      this.board.getPlayersBoard,
      dropCells,
      this.fleet.getFleetWaiting[0]
    );
  }

  public resetBoardElement(
    element: HTMLElement,
    row: number,
    col: number
  ): void {
    let coord: Coordinates = { row: row, col: col } as Coordinates;
    let dropCells = this.board.getShipsDropCells(
      this.board.getPlayersBoard,
      coord,
      this.fleet.getFleetWaiting[0]
    );
    this.board.setPlayersBoard = this.board.resetBoardElement(
      this.board.getPlayersBoard,
      element,
      coord,
      dropCells
    );
  }

  public checkHoveredElement(
    row: number,
    col: number,
    htmlElement: HTMLElement
  ): void {
    let coord: Coordinates = { row: row, col: col } as Coordinates;
    let isDropAllowed: boolean = this.isDroppingShipAllowed(coord);
    if (isDropAllowed && this.isDeploymentAllowed) {
      let dropCells = this.board.getShipsDropCells(
        this.board.getPlayersBoard,
        coord,
        this.fleet.getFleetWaiting[0]
      );
      this.board.setPlayersBoard = this.board.updateHoveredElements(
        dropCells,
        this.board.getPlayersBoard,
        isDropAllowed,
        htmlElement
      );
    }
  }

  public shareOnFacebook(): void {
    let url: string = this.text.getFacebookShareLink(this.gameLink);
    let win = window.open(url, '_blank');
    win.focus();
  }

  public playWithAi(): void {
    let game = this.game.getGame();
    game.gameMulti = false;
    game.players = this.game.setComputerOpponent(game.players);

    this.signalRService.broadcastGameState(game);
  }

  public clearBoard(): void {
    this.fleet.setFleetWaiting = this.fleet.createFleet();
    this.fleet.setFleetDeployed = [];
    this.board.setPlayersBoard = this.board.getEmptyBoard();
    this.isDeployEnabled = false;
  }

  private enableDeployBtnIfPossible(): void {
    this.isDeployEnabled = this.game.shouldBeDeployEnabled(
      this.fleet.getFleetDeployed.length
    );
  }

  public copyToClipboard(): void {
    this.text.copyLink(this.gameLink);
  }

  public autoDeploying(): void {
    this.board.setPlayersBoard = this.ai.autoDeploy(
      this.board.getPlayersBoard,
      this.fleet.getFleetWaiting,
      false,
      this.isDeploymentAllowed
    );
    this.enableDeployBtnIfPossible();
  }

  public confirm(): void {
    if (
      this.fleet.getFleetDeployed.length >= 10 &&
      !this.game.isPlayerDeployed(this.player.getPlayerNumber())
    ) {
      this.count = 0;
      let game: GameState = this.game.getGame();
      game.players[this.player.getPlayerNumber()].isDeployed = true;
      this.isDeployed = this.game.isPlayerDeployed(
        this.player.getPlayerNumber()
      );
      game.players[
        this.player.getPlayerNumber()
      ].board = this.board.getPlayersBoard;
      this.signalRService.broadcastChatMessage('Finished deploying ships.');
      this.signalRService.broadcastGameState(game);
    }
  }

  private startCounter(): void {
    this.countDown = timer(0, 1000).subscribe(() => {
      if (
        this.isDeploymentAllowed &&
        !this.game.isPlayerDeployed(this.player.getPlayerNumber())
      ) {
        if (this.count <= 0) {
          this.board.setPlayersBoard = this.ai.autoDeploy(
            this.board.getPlayersBoard,
            this.fleet.getFleetWaiting,
            false,
            this.isDeploymentAllowed
          );
          this.confirm();
        } else {
          this.count--;
        }
      } else {
        this.count = 180 / this.speedDivider;
      }
    });
  }
}
