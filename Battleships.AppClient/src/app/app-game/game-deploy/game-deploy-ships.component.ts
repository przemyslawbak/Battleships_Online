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
import { BoardCell } from '@models/board-cell.model';
import { Player } from '@models/player.model';
import { FleetService } from '@services/fleet.service';
import { AiService } from '@services/ai.service';

@Component({
  templateUrl: './game-deploy-ships.component.html',
  styleUrls: ['./game-deploy-ships.component.css'],
})
export class GameDeployComponent implements OnInit {
  private speedDivider: number = 1;
  private updateCellsXY: boolean = false;
  private clearedBoard: boolean = true;
  public multiplayer: boolean = false;
  private aiPlayerNumber: number = -1;
  public gameLink: string =
    environment.clientUrl + 'connect-game/' + this.game.getGame().gameId;
  public isDeployed: boolean = false;
  public isDeploymentAllowed: boolean = false;
  public isDeployEnabled: boolean = false;
  public userName: string = '';
  private countDown: Subscription;
  public count: number = 180;
  public fleetWaiting: Array<ShipComponent> = [];
  public fleetDeployed: Array<ShipComponent> = [];
  public playersBoard: BoardCell[][];
  private _subGame: any;
  private _subBoard: any;

  constructor(
    private router: Router,
    private board: BoardService,
    private auth: AuthService,
    private signalRService: SignalRService,
    private game: GameService,
    private player: PlayerService,
    private fleet: FleetService,
    private ai: AiService
  ) {
    this.isDeployed = false;
    this.fleetWaiting = this.fleet.createFleet();
    this.fleetDeployed = [];
  }

  ngOnDestroy() {
    this.countDown = null;
    if (this._subGame && this._subBoard) {
      this._subGame.unsubscribe();
      this._subBoard.unsubscribe();
    }
  }

  public ngOnInit(): void {
    this.board.avoidCells = [];
    this.speedDivider = this.game.getGame().gameSpeedDivider;
    this.count = 180 / this.speedDivider;
    if (!this.game.isGameStarted()) {
      this.router.navigate(['']);
    }
    this.userName = this.auth.getAuth().user;
    this.startCounter();
    this.initGameSubscription();
    this.playersBoard = this.board.getEmptyBoard();
    this.clearedBoard = false;
    this.updateGameValues(this.game.getGame());
  }

  public ngAfterViewInit(): void {
    this.clearedBoard = true;
  }

  private updateGameValues(game: GameState): void {
    if (game) {
      let p0Deployed: boolean = game.players[0].isDeployed;
      let p1Deployed: boolean = game.players[1].isDeployed;
      this.multiplayer = game.gameMulti;
      this.isDeploymentAllowed = game.isDeploymentAllowed;

      if (p0Deployed && p1Deployed) {
        this.router.navigate(['play-game']);
      }

      if (!game.gameMulti) {
        this.aiPlayerNumber = this.findAiPlayerNumber(game.players); //todo: only once
        if (!game.players[this.aiPlayerNumber].isDeployed) {
          this.isDeploymentAllowed = true;
          game.players[this.aiPlayerNumber].board = this.autoDeploy(
            this.board.getEmptyBoard(),
            this.fleet.createFleet(),
            true
          );
          game.players[this.aiPlayerNumber].isDeployed = true;

          this.signalRService.broadcastGameState(game);
        }
      }
    }
  }

  private findAiPlayerNumber(players: Player[]): number {
    for (let i = 0; i < players.length; i++) {
      if (players[i].userName == 'COMPUTER') {
        return i;
      }
    }
  }

  private initGameSubscription() {
    this._subGame = this.game.gameStateChange.subscribe((game) => {
      this.updateGameValues(game);
    });
  }

  private startCounter() {
    this.countDown = timer(0, 1000).subscribe(() => {
      if (this.isDeploymentAllowed && !this.isDeployed) {
        if (this.count <= 0) {
          this.playersBoard = this.autoDeploy(
            this.playersBoard,
            this.fleetWaiting,
            false
          );
          this.confirm();
        } else {
          this.count--;
        }
      } else {
        this.count = 180 / this.speedDivider;
      }
      return this.count;
    });
  }

  public setRotation(name: string): void {
    const id: string = this.getIdFromElementName(name);
    let item: ShipComponent = this.getArrayItem(name, id);
    item.rotation = item.rotation === 0 ? 90 : 0;
  }

  public deployShip(row: number, col: number): void {
    let coord: Coordinates = { row: row, col: col } as Coordinates;
    if (this.board.isDropAllowed && this.isDeploymentAllowed) {
      this.playersBoard = this.board.deployShip(
        this.playersBoard,
        coord,
        this.fleetWaiting[0]
      );
      this.moveFromWaitingToDeployed();
    }

    this.enableDeployBtnIfPossible();
  }

  public resetBoardElement(element: HTMLElement, row: number, col: number) {
    let coord: Coordinates = { row: row, col: col } as Coordinates;
    this.playersBoard = this.board.resetBoardElement(
      this.playersBoard,
      element,
      coord
    );
  }

  public checkHoveredElement(
    row: number,
    col: number,
    element: HTMLElement
  ): void {
    let coord: Coordinates = { row: row, col: col } as Coordinates;
    if (this.isDeploymentAllowed) {
      this.playersBoard = this.board.checkHoveredElement(
        this.playersBoard,
        coord,
        element,
        this.fleetWaiting[0]
      );
    }
  }

  private moveFromWaitingToDeployed(): void {
    this.fleetDeployed.push(this.fleetWaiting[0]);
    this.fleetWaiting.splice(0, 1);
  }

  private getArrayItem(name: string, id: string): ShipComponent {
    return name.split('-')[1] === 'fleetWaiting'
      ? this.fleetWaiting[+id]
      : this.fleetDeployed[+id];
  }

  private getIdFromElementName(name: string): string {
    return name.split('-')[0];
  }

  public confirm(): void {
    if (this.fleetDeployed.length == 10 && !this.isDeployed) {
      this.isDeployed = true;
      this.count = 0;
      let game: GameState = this.game.getGame();
      game.players[this.player.getPlayerNumber()].isDeployed = true;
      game.players[this.player.getPlayerNumber()].board = this.playersBoard;
      this.signalRService.broadcastChatMessage('Finished deploying ships.');
      this.signalRService.broadcastGameState(game);
    }
  }

  public autoDeploying(): void {
    this.playersBoard = this.autoDeploy(
      this.playersBoard,
      this.fleetWaiting,
      false
    );
  }

  public autoDeploy(
    board: BoardCell[][],
    fleet: Array<ShipComponent>,
    computer: boolean
  ): BoardCell[][] {
    if (this.isDeploymentAllowed) {
      while (fleet.length > 0) {
        board = this.ai.autoDeployShip(board, fleet[0]);
        if (computer) {
          fleet.splice(0, 1);
        } else {
          this.moveFromWaitingToDeployed();
        }
      }
      if (!computer) {
        board = this.board.resetEmptyCellsColors(board);
      }
    }

    this.enableDeployBtnIfPossible();

    return board;
  }

  private enableDeployBtnIfPossible(): void {
    if (this.fleetDeployed.length < 10) {
      this.isDeployEnabled = false;
    } else {
      this.isDeployEnabled = true;
    }
  }

  public clearBoard(): void {
    this.fleetWaiting = this.fleet.createFleet();
    this.fleetDeployed = [];
    this.playersBoard = this.board.getEmptyBoard();
    this.clearedBoard = true;
    this.isDeployEnabled = false;
  }

  public copyToClipboard(): void {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', this.gameLink);
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
  }

  public shareOnFacebook(): void {
    let url: string =
      'https://www.facebook.com/sharer/sharer.php?u=' + this.gameLink;
    var win = window.open(url, '_blank');
    win.focus();
  }

  public playWithAi(): void {
    let game = this.game.getGame();
    game.gameMulti = false;
    game.players = this.setComputerOpponent(game.players);

    this.signalRService.broadcastGameState(game);
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

  public assignCellXY(row: number, col: number, ref: HTMLElement): void {
    if (this.clearedBoard && row == 0 && col == 0) {
      this.updateCellsXY = true;
      this.clearedBoard = false;
    }

    if (this.updateCellsXY && !this.clearedBoard) {
      this.playersBoard[col][row].elX = ref.offsetLeft;
      this.playersBoard[col][row].elY = ref.offsetTop - 15;
    }

    if (row == 9 && col == 9) {
      this.updateCellsXY = false;
    }
  }
}
