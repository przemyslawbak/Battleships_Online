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

import { GameState } from '@models/game-state.model';
import { BoardCell } from '@models/board-cell.model';
import { ChatMessage } from '@models/chat-message.model';
import { Player } from '@models/player.model';

@Component({
  templateUrl: './game-deploy-ships.component.html',
  styleUrls: ['./game-deploy-ships.component.css'],
})
export class GameDeployComponent implements OnInit {
  private aiPlayerNumber: number = -1;
  public gameLink: string =
    environment.clientUrl + 'connect-game/' + this.game.getGame().gameId;
  public isDeployed: boolean = false;
  public isDeploymentAllowed: boolean = false;
  public isDeployEnabled: boolean = false;
  public chatMessage: string = '';
  public chatMessages: Array<ChatMessage> = [];
  public userName: string = '';
  private countDown: Subscription;
  public count: number = 30;
  public fleetWaiting: Array<ShipComponent> = [];
  public fleetDeployed: Array<ShipComponent> = [];
  public playersBoard: BoardCell[][];
  private _subGame: any;
  private _subMessage: any;
  private _subBoard: any;

  constructor(
    private router: Router,
    private board: BoardService,
    private auth: AuthService,
    private signalRService: SignalRService,
    private game: GameService,
    private player: PlayerService
  ) {
    this.isDeployed = false;
    this.fleetWaiting = this.createFleet();
    this.fleetDeployed = [];
  }

  ngOnDestroy() {
    this.countDown = null;
    if (this._subGame && this._subMessage && this._subBoard) {
      this._subGame.unsubscribe();
      this._subMessage.unsubscribe();
      this._subBoard.unsubscribe();
    }
  }

  public ngOnInit(): void {
    if (!this.game.isGameStarted()) {
      this.router.navigate(['']);
    }
    this.userName = this.auth.getAuth().user;
    this.startCounter();
    this.resetMessageListeners();
    this.initGameSubscription();
    this.board.createEmptyBoard();
  }

  private updateGameValues(game: GameState): void {
    if (game) {
      let p0Deployed: boolean = game.players[0].isDeployed;
      let p1Deployed: boolean = game.players[1].isDeployed;
      this.isDeploymentAllowed = game.isDeploymentAllowed;

      if (p0Deployed && p1Deployed) {
        this.router.navigate(['play-game']);
      }

      if (!game.gameMulti && game.gameAi) {
        this.aiPlayerNumber = this.findAiPlayerNumber(game.players);
        this.isDeploymentAllowed = true;
        game.players[this.aiPlayerNumber].board = this.autoDeploy(
          this.board.getEmptyBoard(),
          this.createFleet(),
          true
        );
        game.players[this.aiPlayerNumber].isDeployed = true;

        this.game.setGame(game);
        this.signalRService.broadcastGameState(game);
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

    this._subMessage = this.signalRService.messageChange.subscribe(
      (message: ChatMessage) => {
        this.chatMessages = [message].concat(this.chatMessages);
      }
    );

    this._subBoard = this.board.boardChange.subscribe(
      (board: BoardCell[][]) => {
        this.playersBoard = board;
      }
    );
  }

  private startCounter() {
    this.countDown = timer(0, 1000).subscribe(() => {
      console.log(this.isDeployEnabled);
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
        this.count = 180;
      }
      return this.count;
    });
  }

  private resetMessageListeners() {
    this.signalRService.removeChatMessageListener();
    this.signalRService.removeGameStateListener();
    this.signalRService.addChatMessageListener();
    this.signalRService.addGameStateListener();
  }

  public sendChatMessage(): void {
    if (this.chatMessage != '') {
      this.signalRService.broadcastChatMessage(this.chatMessage);
      this.chatMessage = '';
    }
  }

  public setRotation(name: string): void {
    const id: string = this.getIdFromElementName(name);
    let item: ShipComponent = this.getArrayItem(name, id);
    item.rotation = item.rotation === 0 ? 90 : 0;
  }

  public deployShip(row: number, col: number): void {
    if (this.board.isDropAllowed && this.isDeploymentAllowed) {
      this.board.deployShip(row, col, this.fleetWaiting[0]);
      this.moveFromWaitingToDeployed();
    }

    this.enableDeployBtnIfPossible();
  }

  public resetBoardElement(element: HTMLElement, row: number, col: number) {
    this.board.resetBoardElement(element, row, col);
  }

  public checkHoveredElement(
    elementType: string,
    row: number,
    col: number,
    element: HTMLElement
  ): void {
    if (this.isDeploymentAllowed) {
      this.board.checkHoveredElement(
        elementType,
        row,
        col,
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

  private createFleet(): Array<ShipComponent> {
    return [
      { size: 4, rotation: 0 },
      { size: 3, rotation: 0 },
      { size: 3, rotation: 0 },
      { size: 2, rotation: 0 },
      { size: 2, rotation: 0 },
      { size: 2, rotation: 0 },
      { size: 1, rotation: 0 },
      { size: 1, rotation: 0 },
      { size: 1, rotation: 0 },
      { size: 1, rotation: 0 },
    ];
  }

  public confirm(): void {
    console.log('confirm');
    if (this.fleetDeployed.length == 10 && !this.isDeployed) {
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
        board = this.board.autoDeployShip(fleet[0]);
        if (computer) {
          fleet.splice(0, 1);
        } else {
          this.moveFromWaitingToDeployed();
        }
      }
      if (!computer) {
        this.board.resetEmptyCellsColors();
      } else {
        //todo: remove later
        console.log(board);
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
    this.fleetWaiting = this.createFleet();
    this.fleetDeployed = [];
    this.board.createEmptyBoard();
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
    game.gameAi = true;
    game.players = this.setComputerOpponent(game.players);

    this.game.setGame(game);
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
}
