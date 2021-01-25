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
    this.fleet.fleetWaiting = this.fleet.createFleet();
    this.fleet.fleetDeployed = [];
  }

  ngOnInit(): void {
    if (!this.game.isGameStarted()) {
      this.router.navigate(['']);
    } else {
      this.initDeploying();
    }
  }

  ngOnDestroy(): void {
    this.countDown = null;
    if (this._subBoard && this._subGame) {
      this._subGame.unsubscribe();
      this._subBoard.unsubscribe();
    }
  }

  public getFleetWaiting(): ShipComponent[] {
    return this.fleet.fleetWaiting;
  }

  public getPlayersBoard(): BoardCell[][] {
    return this.board.playersBoard;
  }

  private initDeploying(): void {
    this.board.resetAvoidCellsArray();
    this.speedDivider = this.game.getGameSpeedDivider();
    this.count = this.game.getDeployCountdownValue(this.speedDivider);
    this.userName = this.auth.getAuth().user;
    this.startCounter();
    this.initGameSubscription();
    this.board.playersBoard = this.board.getEmptyBoard();
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
      this.fleet.fleetWaiting,
      this.fleet.fleetDeployed
    );
    item.rotation = item.rotation == 0 ? 90 : 0;
  }

  //<---------------------------todo:

  public deployShip(row: number, col: number): void {
    let coord: Coordinates = { row: row, col: col } as Coordinates;
    let isDropAllowed: boolean = this.isDroppingShipAllowed(coord);
    if (isDropAllowed && this.isDeploymentAllowed) {
      this.board.playersBoard = this.board.deployShipOnBoard(
        this.board.playersBoard,
        coord,
        this.fleet.fleetWaiting[0]
      );
      this.fleet.moveFromWaitingToDeployed();
    }

    this.enableDeployBtnIfPossible();
  }

  public resetBoardElement(
    element: HTMLElement,
    row: number,
    col: number
  ): void {
    let coord: Coordinates = { row: row, col: col } as Coordinates;
    let dropCells = this.board.getShipsDropCells(
      this.board.playersBoard,
      coord,
      this.fleet.fleetWaiting[0]
    );
    this.board.playersBoard = this.board.resetBoardElement(
      this.board.playersBoard,
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
        this.board.playersBoard,
        coord,
        this.fleet.fleetWaiting[0]
      );
      this.board.playersBoard = this.board.updateHoveredElements(
        dropCells,
        this.board.playersBoard,
        isDropAllowed,
        htmlElement
      );
    }
  }

  private isDroppingShipAllowed(coord: Coordinates): boolean {
    let dropCells = this.board.getShipsDropCells(
      this.board.playersBoard,
      coord,
      this.fleet.fleetWaiting[0]
    );
    return this.board.verifyHoveredElement(
      this.board.playersBoard,
      dropCells,
      this.fleet.fleetWaiting[0]
    );
  }

  public confirm(): void {
    if (this.fleet.fleetDeployed.length == 10 && !this.isDeployed) {
      this.isDeployed = true;
      this.count = 0;
      let game: GameState = this.game.getGame();
      game.players[this.player.getPlayerNumber()].isDeployed = true;
      game.players[
        this.player.getPlayerNumber()
      ].board = this.board.playersBoard;
      this.signalRService.broadcastChatMessage('Finished deploying ships.');
      this.signalRService.broadcastGameState(game);
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
    game.players = this.player.setComputerPlayerOpponent(game.players);

    this.signalRService.broadcastGameState(game);
  }

  public clearBoard(): void {
    this.fleet.fleetWaiting = this.fleet.createFleet();
    this.fleet.fleetDeployed = [];
    this.board.playersBoard = this.board.getEmptyBoard();
    this.isDeployEnabled = false;
  }

  private enableDeployBtnIfPossible(): void {
    this.isDeployEnabled = this.game.shouldBeDeployEnabled(
      this.fleet.fleetDeployed.length
    );
  }

  public copyToClipboard(): void {
    this.text.copyLink(this.gameLink);
  }

  public autoDeploying(): void {
    this.board.playersBoard = this.ai.autoDeploy(
      this.board.playersBoard,
      this.fleet.fleetWaiting,
      false,
      this.isDeploymentAllowed
    );
    this.enableDeployBtnIfPossible();
  }

  private startCounter(): void {
    this.countDown = timer(0, 1000).subscribe(() => {
      if (this.isDeploymentAllowed && !this.isDeployed) {
        if (this.count <= 0) {
          this.board.playersBoard = this.ai.autoDeploy(
            this.board.playersBoard,
            this.fleet.fleetWaiting,
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
